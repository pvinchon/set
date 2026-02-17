export type { GameState } from "@/game/state/model.ts";
export { generateInitialState } from "@/game/state/generator.ts";
export { selectCard, type SelectionResult } from "@/game/state/actions.ts";
export { renderGame, type RenderOptions } from "@/game/state/renderer.ts";
