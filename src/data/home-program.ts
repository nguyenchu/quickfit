export type MoveId =
  | 'march'
  | 'squat'
  | 'push-up'
  | 'reverse-lunge'
  | 'jumping-jacks'
  | 'glute-bridge'
  | 'chair-dip'
  | 'plank'
  | 'mountain-climber'
  | 'step-back-reach';

export type HomeMove = {
  id: MoveId;
  name: string;
  imageId: MoveId;
  area: string;
  cue: string;
};

export type ProgramExercise = {
  moveId: MoveId;
  target: string;
  note?: string;
};

export type HomeProgram = {
  id: string;
  title: string;
  subtitle: string;
  level: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  workSeconds: number;
  restSeconds: number;
  imageId: MoveId;
  goal: string;
  equipment: string;
  exercises: ProgramExercise[];
};

export const homeMoves: HomeMove[] = [
  {
    id: 'march',
    name: 'March',
    imageId: 'march',
    area: 'Warm up',
    cue: 'Walk in place. Lift one knee at a time.',
  },
  {
    id: 'squat',
    name: 'Squat',
    imageId: 'squat',
    area: 'Legs',
    cue: 'Sit back like there is a chair behind you. Stand tall.',
  },
  {
    id: 'push-up',
    name: 'Push-up',
    imageId: 'push-up',
    area: 'Arms',
    cue: 'Bend your arms. Push the floor away. Knees are okay.',
  },
  {
    id: 'reverse-lunge',
    name: 'Reverse lunge',
    imageId: 'reverse-lunge',
    area: 'Legs',
    cue: 'Step back. Bend both knees a little. Switch legs.',
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping jacks',
    imageId: 'jumping-jacks',
    area: 'Cardio',
    cue: 'Feet out, arms up. Step instead of jump if you want.',
  },
  {
    id: 'glute-bridge',
    name: 'Glute bridge',
    imageId: 'glute-bridge',
    area: 'Hips',
    cue: 'Lie down. Lift your hips. Lower slowly.',
  },
  {
    id: 'chair-dip',
    name: 'Chair dip',
    imageId: 'chair-dip',
    area: 'Arms',
    cue: 'Hands on a sturdy chair. Bend a little. Push up.',
  },
  {
    id: 'plank',
    name: 'Plank',
    imageId: 'plank',
    area: 'Body',
    cue: 'Hold your body like a straight board.',
  },
  {
    id: 'mountain-climber',
    name: 'Mountain climber',
    imageId: 'mountain-climber',
    area: 'Cardio',
    cue: 'Hands down. Bring one knee forward. Switch slowly.',
  },
  {
    id: 'step-back-reach',
    name: 'Step back reach',
    imageId: 'step-back-reach',
    area: 'Full body',
    cue: 'Step one foot back. Reach forward. Come back tall.',
  },
];

export const homePrograms: HomeProgram[] = [
  {
    id: 'easy-home',
    title: 'Easy Home',
    subtitle: 'A soft first workout.',
    level: 'Easy',
    duration: '7 min',
    workSeconds: 30,
    restSeconds: 15,
    imageId: 'squat',
    goal: 'Move slowly and learn the exercises.',
    equipment: 'Mat + chair',
    exercises: [
      { moveId: 'march', target: '30 sec', note: 'Start easy' },
      { moveId: 'squat', target: '30 sec' },
      { moveId: 'step-back-reach', target: '30 sec' },
      { moveId: 'push-up', target: '30 sec', note: 'Use knees if you want' },
      { moveId: 'glute-bridge', target: '30 sec' },
      { moveId: 'reverse-lunge', target: '30 sec' },
      { moveId: 'chair-dip', target: '30 sec', note: 'Use a sturdy chair' },
      { moveId: 'plank', target: '30 sec' },
      { moveId: 'jumping-jacks', target: '30 sec', note: 'Step side to side if needed' },
      { moveId: 'mountain-climber', target: '30 sec', note: 'Go slow' },
    ],
  },
  {
    id: 'medium-home',
    title: 'Medium Home',
    subtitle: 'More movement, still simple.',
    level: 'Medium',
    duration: '8 min',
    workSeconds: 35,
    restSeconds: 15,
    imageId: 'push-up',
    goal: 'Keep moving and listen to the timer.',
    equipment: 'Mat + chair',
    exercises: [
      { moveId: 'march', target: '35 sec' },
      { moveId: 'jumping-jacks', target: '35 sec' },
      { moveId: 'squat', target: '35 sec' },
      { moveId: 'push-up', target: '35 sec' },
      { moveId: 'reverse-lunge', target: '35 sec' },
      { moveId: 'chair-dip', target: '35 sec' },
      { moveId: 'mountain-climber', target: '35 sec' },
      { moveId: 'glute-bridge', target: '35 sec' },
      { moveId: 'plank', target: '35 sec' },
      { moveId: 'step-back-reach', target: '35 sec' },
    ],
  },
  {
    id: 'hard-home',
    title: 'Hard Home',
    subtitle: 'The strongest one. Rest if you need.',
    level: 'Hard',
    duration: '10 min',
    workSeconds: 45,
    restSeconds: 15,
    imageId: 'reverse-lunge',
    goal: 'Try your best. Stop if it hurts.',
    equipment: 'Mat + chair',
    exercises: [
      { moveId: 'jumping-jacks', target: '45 sec', note: 'Step instead of jump if needed' },
      { moveId: 'squat', target: '45 sec' },
      { moveId: 'push-up', target: '45 sec', note: 'Knees are okay' },
      { moveId: 'mountain-climber', target: '45 sec' },
      { moveId: 'reverse-lunge', target: '45 sec' },
      { moveId: 'chair-dip', target: '45 sec' },
      { moveId: 'plank', target: '45 sec' },
      { moveId: 'glute-bridge', target: '45 sec' },
      { moveId: 'step-back-reach', target: '45 sec' },
      { moveId: 'march', target: '45 sec', note: 'Finish strong' },
    ],
  },
];

export function findProgram(id: string | string[] | undefined) {
  const programId = Array.isArray(id) ? id[0] : id;
  return homePrograms.find((program) => program.id === programId);
}

export function findMove(moveId: MoveId) {
  return homeMoves.find((move) => move.id === moveId);
}

export function getProgramMoves(program: HomeProgram) {
  return program.exercises.flatMap((exercise) => {
    const move = findMove(exercise.moveId);
    return move ? [move] : [];
  });
}
