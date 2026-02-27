import { cardEquals } from '$lib/game/card/equality';
import type { Card } from '$lib/game/card/model';
import { createDeck } from '$lib/game/deck/factory';
import { DifficultyLevel, getDifficultyConfig } from '$lib/game/difficulty/model';
import { selectCard, type SelectionResult } from '$lib/game/state/actions';
import { generateInitialState } from '$lib/game/state/generator';
import type { GameState } from '$lib/game/state/model';
import { ANIM_DURATIONS } from '$lib/game/board/animations';

/** Difficulty button metadata for the title screen. */
export const DIFFICULTY_BUTTONS = [
	{
		level: DifficultyLevel.Easy,
		label: 'Easy',
		classes: 'bg-[#648fff] hover:bg-[#5a80e6] active:bg-[#4f70cc]'
	},
	{
		level: DifficultyLevel.Normal,
		label: 'Normal',
		classes: 'bg-[#ffb000] hover:bg-[#e69e00] active:bg-[#cc8d00]'
	},
	{
		level: DifficultyLevel.Hard,
		label: 'Hard',
		classes: 'bg-[#dc267f] hover:bg-[#c62272] active:bg-[#b01e65]'
	}
] as const;

/** Parsed difficulty with validation fallback. */
export function parseDifficulty(raw: string | null): DifficultyLevel {
	return Object.values(DifficultyLevel).includes(raw as DifficultyLevel)
		? (raw as DifficultyLevel)
		: DifficultyLevel.Hard;
}

/** Create a fully initialised game state from a difficulty level. */
export function createGame(difficulty: DifficultyLevel): GameState {
	const config = getDifficultyConfig(difficulty);
	const deck = createDeck(config.deckOptions);
	return generateInitialState(deck, config.boardSize, difficulty);
}

/** Animation state managed by the controller. */
export interface AnimationState {
	animationClass: string;
	affectedIndices: number[];
}

/** Callbacks the controller invokes to drive UI state. */
export interface GameCallbacks {
	setGameState: (state: GameState) => void;
	setAnimation: (anim: AnimationState) => void;
}

/**
 * Handle a card selection, driving animation sequences for valid/invalid sets.
 * Returns immediately for simple selection; orchestrates timeouts for set results.
 */
export function handleSelection(gameState: GameState, card: Card, callbacks: GameCallbacks): void {
	const index = gameState.board.cards.findIndex((c) => cardEquals(c, card));
	if (index === -1) return;

	const result: SelectionResult = selectCard(gameState, index);

	switch (result.type) {
		case 'selected':
			callbacks.setGameState(result.state);
			break;

		case 'valid_set': {
			const indices = [...gameState.selection.indices, index];
			// Show all 3 cards as selected during animation
			callbacks.setGameState({
				...gameState,
				selection: { ...gameState.selection, indices }
			});
			callbacks.setAnimation({ animationClass: 'animate-set-pulse', affectedIndices: indices });

			setTimeout(() => {
				callbacks.setAnimation({ animationClass: 'animate-card-exit', affectedIndices: indices });

				setTimeout(() => {
					callbacks.setGameState(result.state);
					callbacks.setAnimation({
						animationClass: 'animate-card-enter',
						affectedIndices: indices
					});

					setTimeout(() => {
						callbacks.setAnimation({ animationClass: '', affectedIndices: [] });
					}, ANIM_DURATIONS.cardEnter);
				}, ANIM_DURATIONS.cardExit);
			}, ANIM_DURATIONS.setPulse);
			break;
		}

		case 'invalid_set': {
			const indices = [...gameState.selection.indices, index];
			// Show all 3 cards as selected during shake
			callbacks.setGameState({
				...gameState,
				selection: { ...gameState.selection, indices }
			});
			callbacks.setAnimation({ animationClass: 'animate-shake', affectedIndices: indices });

			setTimeout(() => {
				callbacks.setGameState(result.state);
				callbacks.setAnimation({ animationClass: '', affectedIndices: [] });
			}, ANIM_DURATIONS.shake);
			break;
		}
	}
}
