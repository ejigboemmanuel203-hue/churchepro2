// Shared types + config for the Bible quiz feature.

export type QuizQuestion = {
  id: number;
  question: string;
  options: string[]; // always 4
  answer: number; // index 0-3 of the correct option
  explanation: string;
  reference: string;
};

export type DifficultyKey = "beginner" | "intermediate" | "advanced" | "mixed";

export const DIFFICULTIES: {
  key: DifficultyKey;
  label: string;
  desc: string;
  ready: boolean;
}[] = [
  { key: "beginner", label: "Easy", desc: "Foundational stories everyone knows.", ready: true },
  { key: "intermediate", label: "Intermediate", desc: "Kings, prophets, parables & Paul.", ready: true },
  { key: "advanced", label: "Advanced", desc: "Minor prophets, theology & more.", ready: true },
  { key: "mixed", label: "Mixed", desc: "A blend across all levels.", ready: true },
];

export const QUESTION_COUNTS = [10, 20, 30];
