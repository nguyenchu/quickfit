import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { homePrograms } from '@/data/home-program';
import { workoutImages } from '@/data/images';
import { radius, space, useTheme } from '@/lib/theme';

const levelColors: Record<string, string> = {
  Easy: '#2FB36B',
  Medium: '#E8A13A',
  Hard: '#E5544B',
};

export default function HomeScreen() {
  const t = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: t.bg }]}
      alwaysBounceVertical={false}
      overScrollMode="never">
      <View style={styles.container}>
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
