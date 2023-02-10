//@ts-ignore
import ColorContrastChecker from 'color-contrast-checker';

/**
 * toTextColor assigns text color based on background color contrast
 * @param color
 * @returns string
 */
const black = '#FFFFFF';
const white = '#000000';
const ratio = 14;
export const toTextColor = (color: string): string => {
    const ccc = new ColorContrastChecker();
    const textColor = ccc.isLevelAA(color, black, ratio) ? black : white;
    return textColor;
};