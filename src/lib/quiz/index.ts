import { BEGINNER_QUESTIONS } from "./beginner";
import { INTERMEDIATE_QUESTIONS } from "./intermediate";
import { ADVANCED_QUESTIONS } from "./advanced";
import type { DifficultyKey, QuizQuestion } from "./types";

// Question banks per difficulty. Mixed blends across all levels.
const BANKS: Record<DifficultyKey, QuizQuestion[]> = {
  beginner: BEGINNER_QUESTIONS,
  intermediate: INTERMEDIATE_QUESTIONS,
  advanced: ADVANCED_QUESTIONS,
  mixed: [
    ...BEGINNER_QUESTIONS,
    ...INTERMEDIATE_QUESTIONS,
    ...ADVANCED_QUESTIONS,
  ],
};

export function getBank(difficulty: DifficultyKey): QuizQuestion[] {
  return BANKS[difficulty] ?? [];
}

// Fisher-Yates shuffle, returns up to `count` random questions.
export function pickQuestions(
  difficulty: DifficultyKey,
  count: number,
): QuizQuestion[] {
  const bank = [...getBank(difficulty)];
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }
  return bank.slice(0, Math.min(count, bank.length));
}
