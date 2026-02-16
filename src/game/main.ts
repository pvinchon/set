import { createDeck } from "@/game/deck/mod.ts";
import {
  generateInitialState,
  renderGame,
  selectCard,
} from "@/game/state/mod.ts";
import type { GameState } from "@/game/state/mod.ts";

export function initGame(container: HTMLElement): void {
  const deck = createDeck();
  let state: GameState = generateInitialState(deck);

  function render(): void {
    renderGame(state, container, handleCardClick);
  }

  function handleCardClick(index: number): void {
    const result = selectCard(state, index);
    state = result.state;

    if (result.type === "valid_set") {
      container.dataset.feedback = "valid";
      setTimeout(() => delete container.dataset.feedback, 300);
    } else if (result.type === "invalid_set") {
      container.dataset.feedback = "invalid";
      setTimeout(() => delete container.dataset.feedback, 300);
    }

    render();
  }

  render();
}

// Auto-initialize when DOM is ready
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("game-board");
    if (container) {
      initGame(container);
    }
  });
}
