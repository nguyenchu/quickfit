import { Image } from 'expo-image';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { homePrograms } from '@/data/home-program';
import { workoutImages } from '@/data/images';
import { type WorkoutProgress, loadWorkoutProgress } from '@/lib/progress';
import { radius, space, useTheme } from '@/lib/theme';

const levelColors: Record<string, string> = {
  Easy: '#2FB36B',
  Medium: '#E8A13A',
  Hard: '#E5544B',
};

export default function HomeScreen() {
  const t = useTheme();
  const [progress, setProgress] = useState<WorkoutProgress | null>(null);

  const refreshProgress = useCallback(() => {
    void loadWorkoutProgress().then(setProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
    refreshProgress();
    }, [refreshProgress]),
  );

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: t.bg }]}
      alwaysBounceVertical={false}
      overScrollMode="never">
      <View style={styles.container}>
        <View style={[styles.progressCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[styles.progressEyebrow, { color: t.accent }]}>YOUR WEEK</Text>
          <Text style={[styles.progressTitle, { color: t.text }]}>
            {progress?.completedToday ? 'Today is done. Nice work!' : 'One workout is all you need today.'}
          </Text>
          <View style={styles.progressStats}>
            <ProgressStat label="Today" value={`${progress?.completedToday ?? 0}/1`} color={t.text} muted={t.sub} />
            <ProgressStat label="Streak" value={`${progress?.streakDays ?? 0} days`} color={t.text} muted={t.sub} />
            <ProgressStat label="All time" value={`${progress?.totalCompleted ?? 0}`} color={t.text} muted={t.sub} />
          </View>
        </View>

        <Text style={[styles.intro, { color: t.sub }]}>Pick a workout. Tap one to start.</Text>

        {homePrograms.map((program) => (
          <Link
            key={program.id}
            href={{ pathname: '/program/[id]', params: { id: program.id } }}
            asChild>
            <Pressable
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: t.card, borderColor: t.border },
                pressed && styles.pressed,
              ]}>
              <Image
                source={workoutImages[program.id]}
                style={styles.cardImage}
                contentFit="cover"
              />
              <View style={styles.cardBody}>
                <View style={[styles.levelPill, { backgroundColor: levelColors[program.level] }]}>
                  <Text style={styles.levelText}>{program.level}</Text>
                </View>
                <Text style={[styles.title, { color: t.text }]}>{program.title}</Text>
                <Text style={[styles.meta, { color: t.sub }]}>
                  {program.duration} · {program.exercises.length} moves
                </Text>
              </View>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

function ProgressStat({
  label,
  value,
  color,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  muted: string;
}) {
  return (
    <View style={styles.progressStat}>
      <Text style={[styles.progressValue, { color }]}>{value}</Text>
      <Text style={[styles.progressLabel, { color: muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    gap: space.lg,
    padding: space.lg,
    paddingBottom: space.xxl,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  intro: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600',
  },
  progressCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    gap: space.md,
    padding: space.lg,
  },
  progressEyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  progressTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  progressStats: {
    flexDirection: 'row',
    gap: space.sm,
  },
  progressStat: {
    flex: 1,
    gap: 2,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#DCE2EA',
  },
  cardBody: {
    gap: space.xs,
    padding: space.lg,
  },
  levelPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    marginBottom: space.xs,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
  },
  meta: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
});
