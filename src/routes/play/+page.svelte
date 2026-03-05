<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Board from '$lib/game/board/Board.svelte';
	import type { Card } from '$lib/game/card';
	import type { GameState } from '$lib/game/state/model';
	import { getDealInTotalDuration } from '$lib/game/board/animations';
	import PageShell from '$lib/components/PageShell.svelte';
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
</script>

<PageShell>
	<Board
		board={gameState.board}
		selectedCards={selectedCards()}
		onCardSelect={handleCardSelect}
		{animationClass}
		{affectedIndices}
		{initialDeal}
	/>
</PageShell>
