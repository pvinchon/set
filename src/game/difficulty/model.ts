import type { DeckOptions } from "@/game/deck/mod.ts";
import { Num } from "@/game/attributes/mod.ts";

export enum DifficultyLevel {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

export interface DifficultyConfig {
  readonly boardSize: number;
  readonly deckOptions: DeckOptions;
}

const CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  [DifficultyLevel.Easy]: { boardSize: 9, deckOptions: { nums: [Num.A] } },
  [DifficultyLevel.Normal]: { boardSize: 12, deckOptions: { nums: [Num.A] } },
  [DifficultyLevel.Hard]: { boardSize: 12, deckOptions: {} },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return CONFIGS[level];
}
