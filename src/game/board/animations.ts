import { getPositionFactor } from "@/utils/grid.ts";
import { rand } from "@/utils/random.ts";

/** Centralized animation durations (ms). */
export const ANIM_DURATIONS = {
  dealIn: 450,
  setPulse: 600,
  cardExit: 350,
  cardEnter: 400,
  shake: 600,
  stagger: 80,
} as const;

/** Animation tuning constants. */
export const ANIM_CONFIG = {
  /** Maximum rotation (deg) applied by position-based animations. */
  maxRotateDeg: 10,
  /** Duration jitter (±ms) applied per animation instance. */
  durationVariance: 50,
  /** Stagger jitter (±ms) applied per card during initial deal. */
  dealStaggerJitter: 15,
} as const;

export interface RenderOptions {
  /** CSS animation class to apply to affected cards */
  animationClass?: string;
  /** Board indices to apply the animation class to */
  affectedIndices?: number[];
  /** Whether this is the initial deal (stagger entrance animation) */
  initialDeal?: boolean;
}

/** Position-based rotator: uses card grid index (data-index) to derive rotation. */
function positionRotator(
  baseDuration: number,
): (el: HTMLElement) => void {
  return (el) => {
    const idx = Number(el.dataset.index ?? 0);
    const factor = getPositionFactor(idx, el);
    el.style.setProperty(
      "--anim-rotate",
      `${(-factor * ANIM_CONFIG.maxRotateDeg).toFixed(1)}deg`,
    );
    el.style.animationDuration = `${
      Math.round(
        baseDuration +
          rand(-ANIM_CONFIG.durationVariance, ANIM_CONFIG.durationVariance),
      )
    }ms`;
  };
}

/** Per-animation-type customization. */
const ANIM_CUSTOMIZERS: Record<string, (el: HTMLElement) => void> = {
  "animate-deal-in": positionRotator(ANIM_DURATIONS.dealIn),
  "animate-card-exit": positionRotator(ANIM_DURATIONS.cardExit),
  "animate-card-enter": positionRotator(ANIM_DURATIONS.cardEnter),
  "animate-set-pulse": positionRotator(ANIM_DURATIONS.setPulse),
};

/** Apply animation class with per-element customization. */
export function applyAnimation(
  el: HTMLElement,
  animClass: string,
): void {
  el.classList.add(animClass);
  ANIM_CUSTOMIZERS[animClass]?.(el);
}

/** Remove all animation classes and custom properties. */
export function clearAnimation(el: HTMLElement): void {
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
