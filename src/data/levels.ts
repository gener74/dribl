export interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  targetCount: number;
  timeLimit: number; // seconds
  difficulty: "Fàcil" | "Mitjà" | "Difícil";
  videoUrl: string | null;
  youtubeId: string | null;
  icon: string;
  exercise: "ball_touches" | "keepy_uppies";
}

export const LEVELS: Level[] = [
  {
    id: 1,
    title: "Primers Tocs",
    description: "Dóna 5 tocs seguits sense que la pilota toqui terra",
    objective: "Aconsegueix 5 tocs consecutius",
    targetCount: 5,
    timeLimit: 60,
    difficulty: "Fàcil",
    videoUrl: null,
    youtubeId: "pjFLvuXbkuE",
    icon: "⚽",
    exercise: "ball_touches",
  },
  {
    id: 2,
    title: "Malabars",
    description: "Dóna 10 tocs seguits alternant els dos peus",
    objective: "Aconsegueix 10 tocs consecutius",
    targetCount: 10,
    timeLimit: 90,
    difficulty: "Mitjà",
    videoUrl: null,
    youtubeId: null,
    icon: "🎯",
    exercise: "ball_touches",
  },
  {
    id: 3,
    title: "Mestre dels Tocs",
    description: "20 tocs seguits demostrant control total",
    objective: "Aconsegueix 20 tocs consecutius",
    targetCount: 20,
    timeLimit: 120,
    difficulty: "Difícil",
    videoUrl: null,
    youtubeId: null,
    icon: "🏆",
    exercise: "ball_touches",
  },
];
