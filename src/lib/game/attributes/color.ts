// Color of shapes on a card (red, green, blue)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Color {
	A = 0,
	B = 1,
	C = 2
}

export const COLOR_HEX: Record<Color, string> = {
	[Color.A]: '#dc267f',
	[Color.B]: '#648fff',
	[Color.C]: '#ffb000'
};
