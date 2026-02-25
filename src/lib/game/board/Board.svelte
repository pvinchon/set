<script lang="ts">
	import type { Board } from './model.ts';
	import type { Card } from '$lib/game/card/model';
	import CardComponent from '$lib/game/card/Card.svelte';
	import { cardEquals } from '$lib/game/card/equality';
	import {
		ANIM_DURATIONS,
		ANIM_CONFIG,
		getAnimDuration,
		computeAnimRotate
	} from '$lib/game/board/animations';
	import { getPositionFactor } from '$lib/utils/grid';

	let {
		board,
		selectedCards,
		onCardSelect,
		animationClass = '',
		affectedIndices = [],
		initialDeal = false
	}: {
		board: Board;
		selectedCards: Card[];
		onCardSelect: (card: Card) => void;
		animationClass?: string;
		affectedIndices?: number[];
		initialDeal?: boolean;
	} = $props();

	function isSelected(card: Card): boolean {
		return selectedCards.some((c) => cardEquals(c, card));
	}

	function getCardClasses(index: number): string {
		const isAffected = affectedIndices.includes(index);
		const isDeal = initialDeal;

		return [isDeal && 'animate-deal-in', isAffected && animationClass ? animationClass : undefined]
			.filter(Boolean)
			.join(' ');
	}

	function getCardStyle(index: number, el?: HTMLElement): string {
		const isAffected = affectedIndices.includes(index);
		const isDeal = initialDeal;

		const parts: string[] = [];

		if (isDeal) {
			const stagger = index * ANIM_DURATIONS.stagger;
			const jitter = ANIM_CONFIG.dealStaggerJitter;
			parts.push(`animation-delay: ${Math.round(stagger + jitter)}ms`);
			parts.push('opacity: 0');

			const factor = getPositionFactor(index, el);
			parts.push(`--anim-rotate: ${computeAnimRotate(factor)}`);
			parts.push(`animation-duration: ${ANIM_DURATIONS.dealIn}ms`);
		}

		if (isAffected && animationClass) {
			const factor = getPositionFactor(index, el);
			parts.push(`--anim-rotate: ${computeAnimRotate(factor)}`);
			parts.push(`animation-duration: ${getAnimDuration(animationClass)}ms`);
		}

		return parts.join('; ');
	}

	let columns = $derived(board.cards.length === 9 ? 3 : 4);
</script>

<div
	class={[
		'grid w-full max-w-screen-sm gap-4',
		columns === 3 ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4'
	].join(' ')}
>
	{#each board.cards as card, index (index)}
		<div class={getCardClasses(index)} style={getCardStyle(index)} data-index={index}>
			<CardComponent {card} {index} selected={isSelected(card)} onSelect={onCardSelect} />
		</div>
	{/each}
</div>
