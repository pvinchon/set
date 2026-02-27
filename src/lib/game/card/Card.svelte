<script lang="ts">
	import type { Card } from './model.ts';
	import { COLOR_HEX } from '$lib/game/attributes/color';
	import { Shading } from '$lib/game/attributes/shading';
	import {
		shapePath,
		SHAPE_WIDTH,
		SHAPE_HEIGHT,
		SHAPE_STROKE_WIDTH
	} from '$lib/game/attributes/shape';
	import { getPositionFactor } from '$lib/utils/grid';

	let {
		card,
		selected = false,
		index = 0,
		onSelect
	}: {
		card: Card;
		selected?: boolean;
		index?: number;
		onSelect: (card: Card) => void;
	} = $props();

	let count = $derived(card.num + 1);
	let color = $derived(COLOR_HEX[card.color]);
	let path = $derived(shapePath(card.shape, SHAPE_WIDTH, SHAPE_HEIGHT));

	let patternId = $derived(`stripe-${card.color}-${card.shape}`);

	let fill = $derived.by(() => {
		switch (card.shading) {
			case Shading.A:
				return color; // solid
			case Shading.B:
				return `url(#${patternId})`; // striped
			case Shading.C:
				return 'none'; // open
		}
	});

	let viewBox = $derived(
		`${0 - SHAPE_STROKE_WIDTH / 2} ${0 - SHAPE_STROKE_WIDTH / 2} ${SHAPE_WIDTH + SHAPE_STROKE_WIDTH} ${SHAPE_HEIGHT + SHAPE_STROKE_WIDTH}`
	);

	/** Selection transform intensities. */
	const SEL = {
		rotateDeg: 4,
		translateXPx: 6,
		translateYPx: -8,
		scale: 1.08,
		hoverRatio: 1 / 3,
		pressDownTranslateYPx: 3,
		pressDownScale: 0.92
	} as const;

	let buttonEl: HTMLButtonElement | undefined = $state();
	let hovered = $state(false);
	let pressed = $state(false);

	function computeTransform(factor: number, intensity: number): string {
		const rotate = factor * SEL.rotateDeg * intensity;
		const tx = factor * SEL.translateXPx * intensity;
		const ty = SEL.translateYPx * intensity;
		const scale = 1 + (SEL.scale - 1) * intensity;
		return `translateX(${tx.toFixed(1)}px) translateY(${ty.toFixed(1)}px) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
	}

	let cardTransform = $derived.by(() => {
		if (pressed) {
			return `translateY(${SEL.pressDownTranslateYPx}px) scale(${SEL.pressDownScale})`;
		}
		const factor = getPositionFactor(index, buttonEl);
		if (selected) {
			return computeTransform(factor, 1);
		}
		if (hovered) {
			return computeTransform(factor, SEL.hoverRatio);
		}
		return '';
	});

	function handlePointerEnter(e: PointerEvent) {
		if (e.pointerType === 'touch') return;
		if (!selected) hovered = true;
	}

	function handlePointerLeave(e: PointerEvent) {
		if (e.pointerType === 'touch') return;
		hovered = false;
	}

	function handlePointerDown(e: PointerEvent) {
		pressed = true;
		try {
			buttonEl?.setPointerCapture(e.pointerId);
		} catch {
			// Ignore errors from setPointerCapture
		}
	}

	function handlePointerUp() {
		pressed = false;
	}
</script>

<button
	bind:this={buttonEl}
	class={[
		'aspect-[2/3] w-full cursor-pointer rounded-xl border-2 border-gray-300 bg-white p-2 shadow-md',
		'flex flex-col items-center justify-center gap-1',
		'touch-manipulation transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
		selected && 'shadow-lg'
	]
		.filter(Boolean)
		.join(' ')}
	style:transform={cardTransform || undefined}
	onclick={() => onSelect(card)}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointercancel={handlePointerUp}
	data-index={index}
	aria-pressed={selected}
	type="button"
>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each { length: count } as _unused, i (i)}
		<svg {viewBox} class="h-10 w-10">
			<path d={path} {fill} stroke={color} stroke-width="{SHAPE_STROKE_WIDTH}px" />
		</svg>
	{/each}
</button>
