import type { GameState } from "@/game/state/model.ts";
import { cardEquals, renderCard } from "@/game/card/mod.ts";
import type { Card } from "@/game/card/mod.ts";

export interface RenderOptions {
  /** CSS animation class to apply to affected cards */
  animationClass?: string;
  /** Board indices to apply the animation class to */
  affectedIndices?: number[];
  /** Whether this is the initial deal (stagger entrance animation) */
  initialDeal?: boolean;
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
        cardEl.classList.add("animate-deal-in");
        cardEl.style.animationDelay = `${index * 100}ms`;
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

      // Apply animation class if this index is in the affected set
      if (
        options.animationClass &&
        options.affectedIndices?.includes(index)
      ) {
        cardEl.classList.add(options.animationClass);
      }
    } else {
      // Same card — just update selection classes
      const newCardEl = renderCard(card, isSelected);
      cardEl.className = newCardEl.className;
    }

    // Clean up any stale animation classes from previous renders
    // (but keep currently-applied animation classes from options)
    if (!options.animationClass || !options.affectedIndices?.includes(index)) {
      cardEl.classList.remove(
        "animate-deal-in",
        "animate-card-exit",
        "animate-card-enter",
        "animate-set-pulse",
        "animate-shake",
      );
      cardEl.style.removeProperty("animation-delay");
      cardEl.style.removeProperty("opacity");
    }
  });

  previousCards.set(container, [...state.board.cards]);
}
