/** Random float between min and max. */
export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
