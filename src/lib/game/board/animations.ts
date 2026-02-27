/** Centralized animation durations (ms). */
export const ANIM_DURATIONS = {
	dealIn: 450,
	setPulse: 600,
	cardExit: 350,
	cardEnter: 400,
	shake: 600,
	stagger: 80
} as const;

/** Animation tuning constants. */
export const ANIM_CONFIG = {
	/** Maximum rotation (deg) applied by position-based animations. */
	maxRotateDeg: 10,
	/** Duration jitter (±ms) applied per animation instance. */
	durationVariance: 50,
	/** Stagger jitter (±ms) applied per card during initial deal. */
	dealStaggerJitter: 15
} as const;

/** Map animation class name → base duration (ms). */
export function getAnimDuration(animClass: string): number {
	const map: Record<string, number> = {
		'animate-deal-in': ANIM_DURATIONS.dealIn,
		'animate-card-exit': ANIM_DURATIONS.cardExit,
		'animate-card-enter': ANIM_DURATIONS.cardEnter,
		'animate-set-pulse': ANIM_DURATIONS.setPulse,
		'animate-shake': ANIM_DURATIONS.shake
	};
	return map[animClass] ?? 300;
}

/** Compute the total duration of the initial deal-in animation. */
export function getDealInTotalDuration(cardCount: number): number {
	return cardCount * ANIM_DURATIONS.stagger + ANIM_DURATIONS.dealIn + 200;
}

/** Compute the CSS `--anim-rotate` value for a given position factor. */
export function computeAnimRotate(factor: number): string {
	return `${(-factor * ANIM_CONFIG.maxRotateDeg).toFixed(1)}deg`;
}
