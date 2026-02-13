import type { GameState } from "./model.ts";
import { renderCard } from "../card/mod.ts";

export function renderGame(
  state: GameState,
  container: HTMLElement,
  onCardClick: (index: number) => void,
): void {
  container.innerHTML = "";

  state.board.cards.forEach((card, index) => {
    const isSelected = state.selection.indices.includes(index);
    const cardEl = renderCard(card, index, isSelected);

    cardEl.addEventListener("click", () => onCardClick(index));
    container.appendChild(cardEl);
  });
}
