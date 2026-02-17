import type { GameState } from "@/game/state/model.ts";
import { cardEquals, renderCard } from "@/game/card/mod.ts";
import type { Card } from "@/game/card/mod.ts";
import { rand } from "@/utils/random.ts";
import { cardClassName } from "@/game/card/mod.ts";

/** Centralized animation durations (ms) used by both randomizers and orchestration. */
export const ANIM_DURATIONS = {
  dealIn: 450,
  setPulse: 600,
  cardExit: 350,
  cardEnter: 400,
  shake: 600,
  stagger: 80,
  jitter: 50,
} as const;

export interface RenderOptions {
  /** CSS animation class to apply to affected cards */
  animationClass?: string;
  /** Board indices to apply the animation class to */
  affectedIndices?: number[];
  /** Whether this is the initial deal (stagger entrance animation) */
  initialDeal?: boolean;
}

/** Create a randomizer that jitters rotation and duration per element. */
function rotateRandomizer(
  rotateRange: number,
  baseDuration: number,
  variance = 50,
): (el: HTMLElement) => void {
  return (el) => {
    el.style.setProperty(
      "--anim-rotate",
      `${rand(-rotateRange, rotateRange).toFixed(1)}deg`,
    );
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
    }ms`;
  };
}

/** Per-animation-type randomization. */
const ANIM_RANDOMIZERS: Record<string, (el: HTMLElement) => void> = {
  "animate-deal-in": rotateRandomizer(10, ANIM_DURATIONS.dealIn),
  "animate-card-exit": rotateRandomizer(15, ANIM_DURATIONS.cardExit),
  "animate-card-enter": rotateRandomizer(8, ANIM_DURATIONS.cardEnter),
  "animate-set-pulse": rotateRandomizer(3, ANIM_DURATIONS.setPulse),
  "animate-shake": (el) => {
    el.style.animationDuration = `${
      Math.round(
        ANIM_DURATIONS.shake +
          rand(-ANIM_DURATIONS.jitter, ANIM_DURATIONS.jitter),
      )
    }ms`;
  },
};

/** Apply animation class with per-element randomness. */
function applyAnimation(el: HTMLElement, animClass: string): void {
  el.classList.add(animClass);
  ANIM_RANDOMIZERS[animClass]?.(el);
}

/** Remove all animation classes and custom properties. */
function clearAnimation(el: HTMLElement): void {
  el.classList.remove(
    "animate-deal-in",
    "animate-card-exit",
    "animate-card-enter",
    "animate-set-pulse",
    "animate-shake",
  );
  el.style.removeProperty("animation-delay");
  el.style.removeProperty("animation-duration");
  el.style.removeProperty("opacity");
  el.style.removeProperty("--anim-rotate");
}

/**
 * Track previously rendered cards for incremental patching.
 * Key = container element; Value = array of cards rendered at each index.
 */
const previousCards = new WeakMap<HTMLElement, (Card | null)[]>();

export function renderGame(
  state: GameState,
  container: HTMLElement,
  onCardClick: (index: number) => void,
  options: RenderOptions = {},
): void {
  const prev = previousCards.get(container);
  const isFirstRender = !prev || container.children.length === 0;

  if (isFirstRender) {
    // First render: create all card elements from scratch
    container.innerHTML = "";

    state.board.cards.forEach((card, index) => {
      const isSelected = state.selection.indices.includes(index);
      const cardEl = renderCard(card, isSelected);

      cardEl.dataset.index = String(index);
      cardEl.addEventListener("click", () => onCardClick(index));

      if (options.initialDeal) {
        cardEl.style.opacity = "0";
        applyAnimation(cardEl, "animate-deal-in");
        // Stagger with slight per-card jitter (±15ms)
        const jitter = Math.round(rand(-15, 15));
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
      const newCardEl = renderCard(card, isSelected);

      // Preserve the data-index and click handler by replacing inner content
      cardEl.className = newCardEl.className;
      cardEl.innerHTML = "";
      while (newCardEl.firstChild) {
        cardEl.appendChild(newCardEl.firstChild);
      }
    } else {
      // Same card — just update selection classes
      cardEl.className = cardClassName(isSelected);
    }

    // Apply animation class if this index is in the affected set
    if (
      options.animationClass &&
      options.affectedIndices?.includes(index)
    ) {
      applyAnimation(cardEl, options.animationClass);
    }

    // Clean up any stale animation classes from previous renders
    // (but keep currently-applied animation classes from options)
    if (!options.animationClass || !options.affectedIndices?.includes(index)) {
      clearAnimation(cardEl);
    }
  });

  previousCards.set(container, [...state.board.cards]);
}
