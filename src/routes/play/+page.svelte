<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Board from '$lib/game/board/Board.svelte';
	import type { Card } from '$lib/game/card/model';
	import type { GameState } from '$lib/game/state/model';
	import { getDealInTotalDuration } from '$lib/game/board/animations';
	import {
		parseDifficulty,
		createGame,
		handleSelection,
		type AnimationState
	} from '$lib/game/controller';

	const difficulty = parseDifficulty(browser ? page.url.searchParams.get('difficulty') : null);
	const initial = createGame(difficulty);

	let gameState = $state<GameState>(initial);
	let animationClass = $state('');
	let affectedIndices = $state<number[]>([]);
	let initialDeal = $state(true);

	$effect(() => {
		if (initialDeal) {
			const timeout = setTimeout(() => {
				initialDeal = false;
			}, getDealInTotalDuration(gameState.board.cards.length));
			return () => clearTimeout(timeout);
		}
	});

	function selectedCards(): Card[] {
		return gameState.selection.indices.map((i) => gameState.board.cards[i]);
	}

	function handleCardSelect(card: Card) {
		handleSelection(gameState, card, {
			setGameState: (s: GameState) => {
				gameState = s;
			},
			setAnimation: (a: AnimationState) => {
				animationClass = a.animationClass;
				affectedIndices = a.affectedIndices;
			}
		});
	}

	function handleQuit() {
		goto(resolve('/'));
	}
</script>

<div class="flex min-h-screen w-full animate-screen-in flex-col items-center">
	<div class="flex w-full max-w-screen-sm items-center px-4 pt-4">
		<button
			class="cursor-pointer font-medium text-gray-500 transition-colors hover:text-gray-700"
			onclick={handleQuit}
			type="button"
		>
			&larr; back
		</button>
	</div>

	<div class="flex w-full flex-1 items-center justify-center p-4">
		<Board
			board={gameState.board}
			selectedCards={selectedCards()}
			onCardSelect={handleCardSelect}
			{animationClass}
			{affectedIndices}
			{initialDeal}
		/>
	</div>
</div>
