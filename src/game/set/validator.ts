import type { Card } from "@/game/card/mod.ts";

// A set is valid if for each feature, the 3 values are either all same or all different
// Mathematical check: (a + b + c) % 3 === 0 works because:
// - All same (0+0+0=0, 1+1+1=3, 2+2+2=6): sum % 3 === 0
// - All different (0+1+2=3): sum % 3 === 0
// - Two same + one different (0+0+1=1): sum % 3 !== 0

export function isValidSet(a: Card, b: Card, c: Card): boolean {
  const check = (x: number, y: number, z: number): boolean =>
    (x + y + z) % 3 === 0;

  return (
    check(a.num, b.num, c.num) &&
    check(a.shape, b.shape, c.shape) &&
    check(a.shading, b.shading, c.shading) &&
    check(a.color, b.color, c.color)
  );
}

export function hasAnySet(cards: readonly Card[]): boolean {
  const n = cards.length;
  for (let i = 0; i < n - 2; i++) {
    for (let j = i + 1; j < n - 1; j++) {
      for (let k = j + 1; k < n; k++) {
        if (isValidSet(cards[i], cards[j], cards[k])) {
          return true;
        }
      }
    }
  }
  return false;
}
