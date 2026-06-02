import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { type HomeProgram, homePrograms, findMove, findProgram } from '@/data/home-program';
import { homeMoveImages, workoutImages } from '@/data/images';
import { radius, space, useTheme } from '@/lib/theme';

type SessionStep = {
  id: string;
  type: 'work' | 'rest';
  exerciseIndex: number;
  title: string;
  target: string;
  cue: string;
  imageId: string;
  duration: number;
};

export default function ProgramScreen() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const program = findProgram(id);

  if (!program) {
    return (
      <SafeAreaView style={[styles.missing, { backgroundColor: t.bg }]}>
        <Stack.Screen options={{ title: 'Program not found' }} />
        <Text style={[styles.title, { color: t.text }]}>Program not found</Text>
        <Link href="/" asChild>
          <Pressable style={[styles.primaryButton, { backgroundColor: t.accent }]}>
            <Text style={[styles.primaryButtonText, { color: t.accentText }]}>
              Back to programs
            </Text>
          </Pressable>
        </Link>
      </SafeAreaView>
    );
  }

  return <GuidedProgram program={program} />;
}

function GuidedProgram({ program }: { program: HomeProgram }) {
  const t = useTheme();
  const steps = useMemo(() => buildSession(program), [program]);
  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState(steps[0]?.duration ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const currentStep = steps[stepIndex];
  const isComplete = stepIndex >= steps.length;
  const totalSteps = steps.length;
  const progress = totalSteps === 0 ? 0 : Math.min(stepIndex / totalSteps, 1);
  const doneMoves = steps.slice(0, stepIndex).filter((step) => step.type === 'work').length;
  const currentMoveNumber =
    currentStep?.type === 'work'
      ? doneMoves + 1
      : Math.min(doneMoves + 1, program.exercises.length);
  const currentIndex = homePrograms.findIndex((item) => item.id === program.id);
  const previousProgram = homePrograms[currentIndex - 1];
  const nextProgram = homePrograms[currentIndex + 1];

  useEffect(() => {
    setStepIndex(0);
    setRemaining(steps[0]?.duration ?? 0);
    setIsRunning(false);
  }, [program.id, steps]);

  useEffect(() => {
    if (isComplete) {
      setRemaining(0);
      setIsRunning(false);
      return;
    }

    setRemaining(currentStep.duration);
  }, [currentStep, isComplete]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    const interval = setInterval(() => {
      setRemaining((value) => {
        if (value > 1) return value - 1;

        setStepIndex((index) => {
          const nextIndex = index + 1;
          if (nextIndex >= steps.length) {
            setIsRunning(false);
          }
          return nextIndex;
        });
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete, isRunning, steps.length]);

  useEffect(() => {
    if (!isRunning || isComplete) return;

    playGuideCue(
      currentStep.type === 'rest'
        ? `Rest. Next: ${currentStep.title}.`
        : `${currentStep.title}. ${currentStep.cue}`,
    );
  }, [currentStep, isComplete, isRunning]);

  useEffect(() => {
    if (!isRunning || isComplete || remaining !== 3) return;

    playBeep(720, 0.08);
  }, [isComplete, isRunning, remaining]);

  const nextStep = () => {
    setStepIndex((index) => Math.min(index + 1, steps.length));
  };

  const previousStep = () => {
    setStepIndex((index) => Math.max(index - 1, 0));
  };

  const resetWorkout = () => {
    setIsRunning(false);
    setStepIndex(0);
    setRemaining(steps[0]?.duration ?? 0);
  };

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: t.bg }]}
      alwaysBounceVertical={false}
      overScrollMode="never">
      <Stack.Screen options={{ title: program.title }} />
      <View style={styles.safeArea}>
        <View style={styles.container}>
          <View style={[styles.timerPanel, { backgroundColor: t.card }]}>
            <View style={styles.heroWrap}>
              <Image
                source={isComplete ? workoutImages[program.id] : homeMoveImages[currentStep.imageId]}
                style={styles.heroImage}
                contentFit="cover"
              />
              {!isComplete && currentStep.type === 'rest' ? (
                <View style={styles.restOverlay}>
                  <View style={styles.pauseIcon}>
                    <View style={styles.pauseBar} />
                    <View style={styles.pauseBar} />
                  </View>
                  <Text style={styles.restOverlayText}>REST</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.timerContent}>
              <View style={styles.header}>
                <Text style={[styles.kicker, { color: t.accent }]}>
                  {isComplete
                    ? 'All done'
                    : currentStep.type === 'rest'
                      ? 'Rest'
                      : `${program.level} / 10 minutes max`}
                </Text>
                <Text style={[styles.title, { color: t.text }]}>
                  {isComplete
                    ? 'You did it!'
                    : currentStep.type === 'rest'
                      ? `Next: ${currentStep.title}`
                      : currentStep.title}
                </Text>
                <Text style={[styles.subtitle, { color: t.sub }]}>
                  {isComplete
                    ? 'Great job. Tap Again if you want to do it one more time.'
                    : currentStep.type === 'rest'
                      ? `Get ready. ${currentStep.cue}`
                      : currentStep.cue}
                </Text>
              </View>

              <View style={styles.timerRow}>
                <View>
                  <Text style={[styles.timerLabel, { color: t.sub }]}>
                    {isComplete ? 'Done' : currentStep.type === 'rest' ? 'Rest' : 'Move'}
                  </Text>
                  <Text style={[styles.timerValue, { color: t.text }]}>
                    {formatTime(remaining)}
                  </Text>
                </View>
                <View style={[styles.stepPill, { backgroundColor: t.accentSoft }]}>
                  <Text style={[styles.stepPillText, { color: t.accent }]}>
                    {isComplete
                      ? 'Finished'
                      : currentStep.type === 'rest'
                        ? 'Break'
                        : `Move ${currentMoveNumber} of ${program.exercises.length}`}
                  </Text>
                </View>
              </View>

              <View style={[styles.progressTrack, { backgroundColor: t.chip }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: t.accent,
                      width: `${isComplete ? 100 : Math.max(progress * 100, 4)}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.controls}>
                <Pressable
                  onPress={previousStep}
                  disabled={stepIndex === 0}
                  style={({ pressed }) => [
                    styles.controlButton,
                    { backgroundColor: t.chip, opacity: stepIndex === 0 ? 0.45 : 1 },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.controlButtonText, { color: t.text }]}>Back</Text>
                </Pressable>
                <Pressable
                  onPress={() => setIsRunning((value) => !value)}
                  disabled={isComplete}
                  style={({ pressed }) => [
                    styles.primaryControl,
                    { backgroundColor: t.accent, opacity: isComplete ? 0.45 : 1 },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.primaryControlText, { color: t.accentText }]}>
                    {isRunning ? 'Pause' : 'Start'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={nextStep}
                  disabled={isComplete}
                  style={({ pressed }) => [
                    styles.controlButton,
                    { backgroundColor: t.chip, opacity: isComplete ? 0.45 : 1 },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.controlButtonText, { color: t.text }]}>Next</Text>
                </Pressable>
              </View>

              <Pressable onPress={resetWorkout} style={({ pressed }) => [pressed && styles.pressed]}>
                <Text style={[styles.resetText, { color: t.accent }]}>Again</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard label="Total" value={program.duration} />
            <StatCard label="Move" value={`${program.workSeconds}s`} />
            <StatCard label="Rest" value={`${program.restSeconds}s`} />
          </View>

          <View style={[styles.panel, { backgroundColor: t.card }]}>
            <Text style={[styles.panelTitle, { color: t.text }]}>How it works</Text>
            <Text style={[styles.bodyText, { color: t.sub }]}>
              Tap Start. Follow the picture. The voice says what to do. Stop if it hurts.
            </Text>
            <Text style={[styles.equipmentText, { color: t.accent }]}>
              Equipment: {program.equipment}
            </Text>
          </View>

          <View style={[styles.panel, { backgroundColor: t.card }]}>
            <Text style={[styles.panelTitle, { color: t.text }]}>Moves</Text>
            <View style={styles.exerciseList}>
              {program.exercises.map((exercise, index) => {
                const move = findMove(exercise.moveId);
                if (!move) return null;
                const active =
                  !isComplete && currentStep?.type === 'work' && currentStep.exerciseIndex === index;

                return (
                  <View
                    key={`${program.id}-${exercise.moveId}-${index}`}
                    style={[styles.queueRow, active && { backgroundColor: t.accentSoft }]}>
                    <Image
                      source={homeMoveImages[move.imageId]}
                      style={styles.queueThumb}
                      contentFit="cover"
                    />
                    <View style={styles.queueText}>
                      <Text style={[styles.exerciseName, { color: t.text }]}>{move.name}</Text>
                      <Text style={[styles.exerciseCue, { color: t.sub }]}>{move.cue}</Text>
                    </View>
                    <View style={styles.queueRight}>
                      <Text style={[styles.exerciseTarget, { color: t.sub }]}>{exercise.target}</Text>
                      {active ? <Text style={[styles.nowBadge, { color: t.accent }]}>Now</Text> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.navRow}>
            {previousProgram ? (
              <Link
                href={{ pathname: '/program/[id]', params: { id: previousProgram.id } }}
                asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    { backgroundColor: t.card },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.navButtonText, { color: t.text }]}>Last one</Text>
                </Pressable>
              </Link>
            ) : (
              <View style={styles.navButton} />
            )}

            {nextProgram ? (
              <Link
                href={{ pathname: '/program/[id]', params: { id: nextProgram.id } }}
                asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    { backgroundColor: t.accent },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.navButtonText, { color: t.accentText }]}>Next one</Text>
                </Pressable>
              </Link>
            ) : (
              <Link href="/" asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.navButton,
                    { backgroundColor: t.accent },
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.navButtonText, { color: t.accentText }]}>
                    Home
                  </Text>
                </Pressable>
              </Link>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function buildSession(program: HomeProgram): SessionStep[] {
  const steps: SessionStep[] = [];

  program.exercises.forEach((exercise, exerciseIndex) => {
    const move = findMove(exercise.moveId);
    if (!move) return;

    steps.push({
      id: `${program.id}-${exercise.moveId}-work`,
      type: 'work',
      exerciseIndex,
      title: move.name,
      target: exercise.target,
      cue: `${exercise.note ? `${exercise.note}. ` : ''}${move.cue}`,
      imageId: move.imageId,
      duration: program.workSeconds,
    });

    const isLastExercise = exerciseIndex === program.exercises.length - 1;
    if (isLastExercise) return;

    const nextMove = findMove(program.exercises[exerciseIndex + 1].moveId);

    steps.push({
      id: `${program.id}-${exercise.moveId}-rest`,
      type: 'rest',
      exerciseIndex,
      title: nextMove?.name ?? 'Next move',
      target: 'Breathe',
      cue: nextMove?.cue ?? 'Get ready for the next move.',
      imageId: nextMove?.imageId ?? move.imageId,
      duration: program.restSeconds,
    });
  });

  return steps;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function StatCard({ label, value }: { label: string; value: string }) {
  const t = useTheme();

  return (
    <View style={[styles.statCard, { backgroundColor: t.card }]}>
      <Text style={[styles.statValue, { color: t.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: t.sub }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    gap: space.xl,
    padding: space.lg,
    paddingBottom: space.xxl,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  missing: {
    flex: 1,
    gap: space.lg,
    justifyContent: 'center',
    padding: space.xl,
  },
  timerPanel: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  heroWrap: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#DCE2EA',
  },
  restOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.md,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: space.sm,
  },
  pauseBar: {
    width: 12,
    height: 44,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  restOverlayText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: 3,
  },
  timerContent: {
    gap: space.lg,
    padding: space.lg,
  },
  header: {
    gap: space.sm,
  },
  kicker: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  timerLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  timerValue: {
    fontSize: 72,
    lineHeight: 78,
    fontWeight: '900',
  },
  stepPill: {
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
  },
  stepPillText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.sm,
  },
  controls: {
    flexDirection: 'row',
    gap: space.sm,
  },
  controlButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryControl: {
    flex: 1.3,
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  primaryControlText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  resetText: {
    alignSelf: 'center',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.md,
    padding: space.md,
  },
  statValue: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  panel: {
    borderRadius: radius.md,
    gap: space.lg,
    padding: space.lg,
  },
  panelTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '900',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '600',
  },
  equipmentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '900',
  },
  exerciseList: {
    gap: space.sm,
  },
  queueRow: {
    minHeight: 74,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.sm,
  },
  queueThumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: '#DCE2EA',
  },
  queueText: {
    flex: 1,
    gap: space.xs,
  },
  queueRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  nowBadge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  exerciseName: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  exerciseTarget: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  exerciseCue: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: space.sm,
  },
  navButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});

// On web the browser may default to a robotic or "novelty" voice (Safari exposes
// many), which sounds wrong. Pick a natural en-US voice once and reuse it.
// `undefined` = unresolved, `null` = resolved but none found.
const PREFERRED_WEB_VOICES = ['Google US English', 'Samantha', 'Aria', 'Zira', 'Alex'];
let webVoiceId: string | null | undefined;

async function resolveWebVoiceId(): Promise<string | undefined> {
  if (Platform.OS !== 'web') return undefined;
  if (webVoiceId !== undefined) return webVoiceId ?? undefined;

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices.length) return undefined; // not loaded yet — retry on next cue
    const english = voices.filter((v) => v.language.toLowerCase().startsWith('en'));
    const enUS = english.filter((v) =>
      v.language.toLowerCase().replace('_', '-').startsWith('en-us'),
    );
    const pool = enUS.length ? enUS : english;
    const preferred = pool.find((v) =>
      PREFERRED_WEB_VOICES.some((name) => v.name.toLowerCase().includes(name.toLowerCase())),
    );
    webVoiceId = (preferred ?? pool[0])?.identifier ?? null;
  } catch {
    webVoiceId = null;
  }
  return webVoiceId ?? undefined;
}

function playGuideCue(text: string) {
  playBeep(520, 0.1);
  Speech.stop();
  void speakCue(text);
}

async function speakCue(text: string) {
  const voice = await resolveWebVoiceId();
  Speech.speak(text, {
    language: 'en-US',
    rate: 1,
    pitch: 1,
    volume: 0.9,
    // iOS: let the system manage a dedicated speech audio session so TTS plays
    // reliably (helps when no app-wide audio session is configured).
    useApplicationAudioSession: false,
    // web: force a natural en-US voice instead of the browser default.
    ...(voice ? { voice } : {}),
  });
}

function playBeep(frequency: number, duration: number) {
  if (Platform.OS !== 'web') return;

  const runtime = globalThis as any;
  const AudioContext = runtime.AudioContext ?? runtime.webkitAudioContext;
  if (!AudioContext) return;

  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  gain.gain.value = 0.08;
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}
