import { createDeck } from "@/game/deck/mod.ts";
import { generateInitialState, selectCard } from "@/game/state/mod.ts";
import type { GameState } from "@/game/state/mod.ts";
import {
  applySelectionTransform,
  cardClassName,
  cardEquals,
  renderCard,
} from "@/game/card/mod.ts";
import type { Card } from "@/game/card/mod.ts";
import {
  type DifficultyConfig,
  DifficultyLevel,
  getDifficultyConfig,
} from "@/game/difficulty/mod.ts";
import {
  ANIM_CONFIG,
  ANIM_DURATIONS,
  applyAnimation,
  clearAnimation,
  type RenderOptions,
} from "@/game/board/animations.ts";
import { rand } from "@/utils/random.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AnimationPhase =
  | "idle"
  | "dealing"
  | "valid-pulse"
  | "valid-exit"
  | "valid-enter"
  | "invalid-shake";

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

/**
 * Track previously rendered cards for incremental patching.
 * Key = container element; Value = array of cards rendered at each index.
 */
const previousCards = new WeakMap<HTMLElement, (Card | null)[]>();

function renderBoard(
  state: GameState,
  container: HTMLElement,
  onCardClick: (index: number) => void,
  options: RenderOptions = {},
): void {
  const prev = previousCards.get(container);
  const isFirstRender = !prev || container.children.length === 0;

  if (isFirstRender) {
    container.innerHTML = "";

    state.board.cards.forEach((card, index) => {
      const isSelected = state.selection.indices.includes(index);
      const cardEl = renderCard(card, isSelected, index);

      cardEl.dataset.index = String(index);
      cardEl.addEventListener("click", () => onCardClick(index));

      if (options.initialDeal) {
        cardEl.style.opacity = "0";
        applyAnimation(cardEl, "animate-deal-in");
        const jitter = Math.round(
          rand(-ANIM_CONFIG.dealStaggerJitter, ANIM_CONFIG.dealStaggerJitter),
        );
        cardEl.style.animationDelay = `${
          index * ANIM_DURATIONS.stagger + jitter
        }ms`;
      }

      container.appendChild(cardEl);
    });

    previousCards.set(container, [...state.board.cards]);
    return;
  }

  // Incremental patch: update existing card elements in-place
  state.board.cards.forEach((card, index) => {
    const cardEl = container.children[index] as HTMLElement;
    if (!cardEl) return;

    const prevCard = prev[index];
    const isSelected = state.selection.indices.includes(index);
    const cardChanged = !prevCard || !cardEquals(prevCard, card);

    if (cardChanged) {
      // Card data changed — rebuild the element content
      const newCardEl = renderCard(card, isSelected, index);

      // Preserve the data-index and click handler by replacing inner content
      cardEl.className = newCardEl.className;
      cardEl.innerHTML = "";
      while (newCardEl.firstChild) {
        cardEl.appendChild(newCardEl.firstChild);
      }
      // Sync the inline selection transform
      applySelectionTransform(cardEl, index, isSelected);
    } else {
      // Same card — just update selection classes and transform
      cardEl.className = cardClassName(isSelected);
      applySelectionTransform(cardEl, index, isSelected);
    }

    // Apply animation class if this index is in the affected set
    if (
      options.animationClass &&
      options.affectedIndices?.includes(index)
    ) {
      applyAnimation(cardEl, options.animationClass);
    }

    // Clean up any stale animation classes from previous renders
    if (!options.animationClass || !options.affectedIndices?.includes(index)) {
      clearAnimation(cardEl);
    }
  });

  previousCards.set(container, [...state.board.cards]);
}

// ---------------------------------------------------------------------------
// Grid layout
// ---------------------------------------------------------------------------

function applyGridLayout(
  container: HTMLElement,
  config: DifficultyConfig,
): void {
  if (config.boardSize % 3 === 0) {
    container.classList.add("grid-cols-3");
  }
  if (config.boardSize % 4 === 0) {
    container.classList.add("sm:grid-cols-4");
  }
}

// ---------------------------------------------------------------------------
// Board component — public API
// ---------------------------------------------------------------------------

function withFullSelection(
  state: GameState,
  selectedIndices: number[],
): GameState {
  return {
    ...state,
    selection: { ...state.selection, indices: selectedIndices },
  };
}

/** Mount a board component into `container` for the given difficulty. */
export function mountBoard(
  container: HTMLElement,
  difficulty: DifficultyLevel,
): void {
  const config = getDifficultyConfig(difficulty);
  const deck = createDeck(config.deckOptions);
  let state: GameState = generateInitialState(
    deck,
    config.boardSize,
    difficulty,
  );
  let phase: AnimationPhase = "idle";

  applyGridLayout(container, config);

  function render(options: RenderOptions = {}): void {
    renderBoard(state, container, handleCardClick, options);
  }

  function handleCardClick(index: number): void {
    if (phase !== "idle") return;

    const previousState = state;
    const result = selectCard(state, index);

    if (result.type === "valid_set") {
      const selectedIndices = [...previousState.selection.indices, index];
      phase = "valid-pulse";

      // Step 1: Pulse animation on the 3 selected cards
      state = withFullSelection(previousState, selectedIndices);
      render({
        animationClass: "animate-set-pulse",
        affectedIndices: selectedIndices,
      });

      setTimeout(() => {
        // Step 2: Exit — cards fly up and out with rotation
        phase = "valid-exit";
        render({
          animationClass: "animate-card-exit",
          affectedIndices: selectedIndices,
        });

        setTimeout(() => {
          // Step 3: New cards drop in with bounce
          phase = "valid-enter";
          state = result.state;
          render({
            animationClass: "animate-card-enter",
            affectedIndices: selectedIndices,
          });

          setTimeout(() => {
            // Step 4: Clean up and return to idle
            phase = "idle";
            render();
          }, ANIM_DURATIONS.cardEnter);
        }, ANIM_DURATIONS.cardExit);
      }, ANIM_DURATIONS.setPulse);
    } else if (result.type === "invalid_set") {
      const selectedIndices = [...previousState.selection.indices, index];
      phase = "invalid-shake";

      state = withFullSelection(previousState, selectedIndices);
      render({
        animationClass: "animate-shake",
        affectedIndices: selectedIndices,
      });

      setTimeout(() => {
        phase = "idle";
        state = result.state;
        render();
      }, ANIM_DURATIONS.shake);
    } else {
      // Simple selection toggle — no animation blocking
      state = result.state;
      render();
    }
  }

  // Initial deal — staggered fly-in
  phase = "dealing";
  render({ initialDeal: true });

  const dealDuration = state.board.cards.length * ANIM_DURATIONS.stagger +
    ANIM_DURATIONS.dealIn;
  setTimeout(() => {
    phase = "idle";
    render();
  }, dealDuration);
}

/** Tear down the board, clearing rendered content. */
export function unmountBoard(container: HTMLElement): void {
  previousCards.delete(container);
  container.innerHTML = "";
  container.className = container.className.replace(/grid-cols-\S+/g, "")
    .trim();
}
