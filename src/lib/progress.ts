import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@quickfit/completed-workouts';

export type CompletedWorkout = {
  programId: string;
  completedAt: string;
};

export type WorkoutProgress = {
  completedToday: number;
  totalCompleted: number;
  streakDays: number;
  recentWorkouts: CompletedWorkout[];
};

function localDayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(workouts: CompletedWorkout[], now = new Date()) {
  const completedDays = new Set(
    workouts.map((workout) => localDayKey(new Date(workout.completedAt))),
  );
  let streak = 0;
  const cursor = new Date(now);

  while (completedDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function readWorkouts(raw: string | null): CompletedWorkout[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CompletedWorkout[]) : [];
  } catch {
    return [];
  }
}

export async function loadWorkoutProgress(): Promise<WorkoutProgress> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const recentWorkouts = readWorkouts(raw);
  const today = localDayKey(new Date());

  return {
    completedToday: recentWorkouts.filter(
      (workout) => localDayKey(new Date(workout.completedAt)) === today,
    ).length,
    totalCompleted: recentWorkouts.length,
    streakDays: calculateStreak(recentWorkouts),
    recentWorkouts,
  };
}

export async function recordWorkoutCompletion(programId: string) {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const workouts = readWorkouts(raw);
  const completedAt = new Date().toISOString();
  const next = [{ programId, completedAt }, ...workouts].slice(0, 100);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return loadWorkoutProgress();
}
