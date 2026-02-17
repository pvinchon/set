import { createDeck } from "@/game/deck/mod.ts";
import {
  generateInitialState,
  renderGame,
  selectCard,
} from "@/game/state/mod.ts";
import type { GameState, RenderOptions } from "@/game/state/mod.ts";

type AnimationPhase =
  | "idle"
  | "dealing"
  | "valid-pulse"
  | "valid-exit"
  | "valid-enter"
  | "invalid-shake";

interface AnimationState {
  phase: AnimationPhase;
}

export function initGame(container: HTMLElement): void {
  const deck = createDeck();
  let state: GameState = generateInitialState(deck);
  const animation: AnimationState = { phase: "idle" };

  function render(options: RenderOptions = {}): void {
    renderGame(state, container, handleCardClick, options);
  }

  function handleCardClick(index: number): void {
    // Drop all clicks during any animation
    if (animation.phase !== "idle") return;

    const previousState = state;
    const result = selectCard(state, index);

    if (result.type === "valid_set") {
      // --- Valid set animation sequence ---
      const selectedIndices = [...previousState.selection.indices, index];
      animation.phase = "valid-pulse";

      // Step 1: Pulse animation on the 3 selected cards (500ms)
      // Re-render with old state + pulse class before applying new state
      state = {
        ...previousState,
        selection: {
          ...previousState.selection,
          indices: selectedIndices,
        },
      };
      render({
        animationClass: "animate-set-pulse",
        affectedIndices: selectedIndices,
      });

      // Apply green feedback classes directly to the affected card elements
      for (const i of selectedIndices) {
        const cardEl = container.children[i] as HTMLElement;
        if (cardEl) {
          cardEl.classList.remove("border-blue-500", "ring-blue-500/30");
          cardEl.classList.add(
            "border-green-600",
            "ring-3",
            "ring-green-600/40",
          );
        }
      }

      setTimeout(() => {
        // Step 2: Exit animation on the 3 cards (300ms)
        animation.phase = "valid-exit";
        render({
          animationClass: "animate-card-exit",
          affectedIndices: selectedIndices,
        });

        setTimeout(() => {
          // Step 3: Apply new state and enter animation (300ms)
          animation.phase = "valid-enter";
          state = result.state;
          render({
            animationClass: "animate-card-enter",
            affectedIndices: selectedIndices,
          });

          setTimeout(() => {
            // Step 4: Clean up and return to idle
            animation.phase = "idle";
            render();
          }, 300);
        }, 300);
      }, 500);
    } else if (result.type === "invalid_set") {
      // --- Invalid set animation sequence ---
      const selectedIndices = [...previousState.selection.indices, index];
      animation.phase = "invalid-shake";

      // Render with all 3 cards selected + shake
      state = {
        ...previousState,
        selection: {
          ...previousState.selection,
          indices: selectedIndices,
        },
      };
      render({
        animationClass: "animate-shake",
        affectedIndices: selectedIndices,
      });

      // Apply red feedback classes directly to the affected card elements
      for (const i of selectedIndices) {
        const cardEl = container.children[i] as HTMLElement;
        if (cardEl) {
          cardEl.classList.remove("border-blue-500", "ring-blue-500/30");
          cardEl.classList.add(
            "border-red-600",
            "ring-3",
            "ring-red-600/40",
          );
        }
      }

      setTimeout(() => {
        // Apply deselected state and return to idle
        animation.phase = "idle";
        state = result.state;
        render();
      }, 500);
    } else {
      // Simple selection toggle — no animation blocking
      state = result.state;
      render();
    }
  }

  // Initial deal with staggered entrance
  animation.phase = "dealing";
  render({ initialDeal: true });

  // Calculate total deal time: 12 cards × 100ms stagger + 300ms animation
  const dealDuration = state.board.cards.length * 100 + 300;
  setTimeout(() => {
    animation.phase = "idle";
    render();
  }, dealDuration);
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
