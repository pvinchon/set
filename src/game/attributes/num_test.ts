import { assertEquals } from "jsr:@std/assert@1";
import { Num } from "./num.ts";

Deno.test("Num enum has values 0, 1, 2", () => {
  assertEquals(Num.A, 0);
  assertEquals(Num.B, 1);
  assertEquals(Num.C, 2);
});

Deno.test("Num values enable modular arithmetic", () => {
  // All same: sum divisible by 3
  assertEquals((Num.A + Num.A + Num.A) % 3, 0);
  assertEquals((Num.B + Num.B + Num.B) % 3, 0);
  assertEquals((Num.C + Num.C + Num.C) % 3, 0);

  // All different: sum divisible by 3
  assertEquals((Num.A + Num.B + Num.C) % 3, 0);

  // Two same + one different: sum NOT divisible by 3
  assertEquals((Num.A + Num.A + Num.B) % 3 !== 0, true);
  assertEquals((Num.B + Num.B + Num.A) % 3 !== 0, true);
});
