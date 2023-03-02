/**
 * It takes a width and height and returns a percentage value that represents the height as a
 * percentage of the width
 * @param {number} width - The width of the image.
 * @param {number} height - number - The height of the element
 * @returns A string with the aspect ratio of the image.
 */
export function getAspectRatio(width?: number, height?: number) {
    if (!width || !height) return '';
    const ratio = (height / width) * 100;
    return `${ratio}%`;
}