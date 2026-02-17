import { createDeck } from "@/game/deck/mod.ts";
import {
  ANIM_DURATIONS,
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

function withFullSelection(
  previousState: GameState,
  selectedIndices: number[],
): GameState {
  return {
    ...previousState,
    selection: { ...previousState.selection, indices: selectedIndices },
  };
}

function applyFeedbackColor(
  container: HTMLElement,
  indices: number[],
  color: "green" | "red",
): void {
  for (const i of indices) {
    const cardEl = container.children[i] as HTMLElement;
    if (cardEl) {
      cardEl.classList.remove(
        "border-blue-500",
        "border-[3px]",
        "ring-blue-500/30",
        "shadow-blue-500/25",
      );
      cardEl.classList.add(
        "border-[3px]",
        "ring-4",
        color === "green" ? "border-green-500" : "border-red-500",
        color === "green" ? "ring-green-500/40" : "ring-red-500/40",
        color === "green" ? "shadow-green-500/30" : "shadow-red-500/30",
      );
    }
  }
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

      // Step 1: Pulse animation on the 3 selected cards (600ms)
      state = withFullSelection(previousState, selectedIndices);
      render({
        animationClass: "animate-set-pulse",
        affectedIndices: selectedIndices,
      });
      applyFeedbackColor(container, selectedIndices, "green");

      setTimeout(() => {
        // Step 2: Exit — cards fly up and out with rotation
        animation.phase = "valid-exit";
        render({
          animationClass: "animate-card-exit",
          affectedIndices: selectedIndices,
        });
        applyFeedbackColor(container, selectedIndices, "green");

        setTimeout(() => {
          // Step 3: New cards drop in with bounce
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
          }, ANIM_DURATIONS.cardEnter);
        }, ANIM_DURATIONS.cardExit);
      }, ANIM_DURATIONS.setPulse);
    } else if (result.type === "invalid_set") {
      // --- Invalid set animation sequence ---
      const selectedIndices = [...previousState.selection.indices, index];
      animation.phase = "invalid-shake";

      state = withFullSelection(previousState, selectedIndices);
      render({
        animationClass: "animate-shake",
        affectedIndices: selectedIndices,
      });
      applyFeedbackColor(container, selectedIndices, "red");

      setTimeout(() => {
        animation.phase = "idle";
        state = result.state;
        render();
      }, ANIM_DURATIONS.shake);
    } else {
      // Simple selection toggle — no animation blocking
      state = result.state;
      render();
    }
  }

  // Initial deal — staggered fly-in from below
  animation.phase = "dealing";
  render({ initialDeal: true });

  const dealDuration = state.board.cards.length * ANIM_DURATIONS.stagger +
    ANIM_DURATIONS.dealIn;
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
