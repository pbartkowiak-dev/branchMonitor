const colors = {
	ORANGE: 0,
	BLUE: 1,
	GREEN: 2,
	DARK: 3,
	AQUA: 4,
	RED: 5,
	GRAY: 6
};

export function getNextColor(currentColor) {
	const currentColorNum = Number(currentColor);

	if (currentColorNum >= Object.keys(colors).length - 1) {
		return 0;
	} else {
		return currentColorNum + 1;
	}
}

export default colors;
