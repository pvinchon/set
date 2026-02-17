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

function initGame(container: HTMLElement): void {
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

      // Apply green feedback to the affected card elements
      for (const i of selectedIndices) {
        const cardEl = container.children[i] as HTMLElement;
        if (cardEl) {
          cardEl.classList.remove(
            "border-blue-500",
            "border-[3px]",
            "ring-blue-500/30",
            "shadow-blue-500/25",
          );
          cardEl.classList.add(
            "border-green-500",
            "border-[3px]",
            "ring-4",
            "ring-green-500/40",
            "shadow-green-500/30",
          );
        }
      }

      setTimeout(() => {
        // Step 2: Exit — cards fly up and out with rotation (350ms)
        animation.phase = "valid-exit";
        render({
          animationClass: "animate-card-exit",
          affectedIndices: selectedIndices,
        });

        setTimeout(() => {
          // Step 3: New cards drop in with bounce (400ms)
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
          }, 400);
        }, 350);
      }, 600);
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

      // Apply red rejection feedback
      for (const i of selectedIndices) {
        const cardEl = container.children[i] as HTMLElement;
        if (cardEl) {
          cardEl.classList.remove(
            "border-blue-500",
            "border-[3px]",
            "ring-blue-500/30",
            "shadow-blue-500/25",
          );
          cardEl.classList.add(
            "border-red-500",
            "border-[3px]",
            "ring-4",
            "ring-red-500/40",
            "shadow-red-500/30",
          );
        }
      }

      setTimeout(() => {
        // Apply deselected state and return to idle
        animation.phase = "idle";
        state = result.state;
        render();
      }, 600);
    } else {
      // Simple selection toggle — no animation blocking
      state = result.state;
      render();
    }
  }

  // Initial deal — staggered fly-in from below
  animation.phase = "dealing";
  render({ initialDeal: true });

  // Deal time: 12 cards × 80ms stagger + 450ms final card animation
  const dealDuration = state.board.cards.length * 80 + 450;
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
