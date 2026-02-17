import type { GameState } from "@/game/state/model.ts";
import { cardEquals, renderCard } from "@/game/card/mod.ts";
import type { Card } from "@/game/card/mod.ts";
import { rand, randSign } from "@/utils/random.ts";

export interface RenderOptions {
  /** CSS animation class to apply to affected cards */
  animationClass?: string;
  /** Board indices to apply the animation class to */
  affectedIndices?: number[];
  /** Whether this is the initial deal (stagger entrance animation) */
  initialDeal?: boolean;
}

/** Per-animation-type randomization: plain random ranges with explicit base + variance. */
const ANIM_RANDOMIZERS: Record<string, (el: HTMLElement) => void> = {
  "animate-deal-in": (el) => {
    const baseDuration = 450, variance = 50; // ms
    el.style.setProperty("--anim-rotate", `${rand(-10, 10).toFixed(1)}deg`);
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
    }ms`;
  },
  "animate-card-exit": (el) => {
    const baseDuration = 350, variance = 50;
    el.style.setProperty("--anim-rotate", `${rand(-15, 15).toFixed(1)}deg`);
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
    }ms`;
  },
  "animate-card-enter": (el) => {
    const baseDuration = 400, variance = 50;
    el.style.setProperty("--anim-rotate", `${rand(-8, 8).toFixed(1)}deg`);
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
    }ms`;
  },
  "animate-set-pulse": (el) => {
    const baseDuration = 600, variance = 50;
    el.style.setProperty("--anim-rotate", `${rand(-3, 3).toFixed(1)}deg`);
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
    }ms`;
  },
  "animate-shake": (el) => {
    const baseDuration = 600, variance = 50;
    el.style.setProperty("--anim-dir", `${randSign()}`);
    el.style.animationDuration = `${
      Math.round(baseDuration + rand(-variance, variance))
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
  el.style.removeProperty("--anim-y");
  el.style.removeProperty("--anim-rotate");
  el.style.removeProperty("--anim-bounce");
  el.style.removeProperty("--anim-dir");
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
        cardEl.style.animationDelay = `${index * 80 + jitter}ms`;
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
      const newCardEl = renderCard(card, isSelected);
      cardEl.className = newCardEl.className;
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
