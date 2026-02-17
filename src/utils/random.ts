/** Random float between min and max. */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random -1 or 1. */
export function randSign(): number {
  return Math.random() < 0.5 ? -1 : 1;
}
