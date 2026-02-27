import { expect, test } from 'vitest';
import { DifficultyLevel, getDifficultyConfig } from '$lib/game/difficulty';
import { Num } from '$lib/game/attributes';

test('Easy config has boardSize 9 and nums fixed to Num.A', () => {
	const config = getDifficultyConfig(DifficultyLevel.Easy);
	expect(config.boardSize).toEqual(9);
	expect(config.deckOptions.nums).toEqual([Num.A]);
});

test('Normal config has boardSize 12 and nums fixed to Num.A', () => {
	const config = getDifficultyConfig(DifficultyLevel.Normal);
	expect(config.boardSize).toEqual(12);
	expect(config.deckOptions.nums).toEqual([Num.A]);
});

test('Hard config has boardSize 12 and no attribute restrictions', () => {
	const config = getDifficultyConfig(DifficultyLevel.Hard);
	expect(config.boardSize).toEqual(12);
	expect(config.deckOptions).toEqual({});
});

test('all DifficultyLevel values have a config', () => {
	for (const level of Object.values(DifficultyLevel)) {
		const config = getDifficultyConfig(level);
		expect(typeof config.boardSize).toEqual('number');
	}
});
