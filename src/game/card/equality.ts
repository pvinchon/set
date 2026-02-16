import type { Card } from "@/game/card/model.ts";

export function cardEquals(a: Card, b: Card): boolean {
  return (
    a.num === b.num &&
    a.shape === b.shape &&
    a.shading === b.shading &&
    a.color === b.color
  );
}
