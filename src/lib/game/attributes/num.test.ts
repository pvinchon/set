import { expect, test } from 'vitest';
import { Num } from '$lib/game/attributes/num';

test('Num enum has values 0, 1, 2', () => {
	expect(Num.A).toEqual(0);
	expect(Num.B).toEqual(1);
	expect(Num.C).toEqual(2);
});

test('Num values enable modular arithmetic', () => {
	// All same: sum divisible by 3
	expect((Num.A + Num.A + Num.A) % 3).toEqual(0);
	expect((Num.B + Num.B + Num.B) % 3).toEqual(0);
	expect((Num.C + Num.C + Num.C) % 3).toEqual(0);

	// All different: sum divisible by 3
	expect((Num.A + Num.B + Num.C) % 3).toEqual(0);

	// Two same + one different: sum NOT divisible by 3
	expect((Num.A + Num.A + Num.B) % 3 !== 0).toEqual(true);
	expect((Num.B + Num.B + Num.A) % 3 !== 0).toEqual(true);
});
