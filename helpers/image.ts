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

/**
 * It converts an array of numbers to a base64 string for image buffer converstion
 * @param {number[]} buffer - the array buffer you want to convert to base64
 * @returns A base64 encoded string.
 */
export function arrayBufferToBase64(buffer: number[]) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

/**
 * It takes a base64 string and returns an array buffer
 * @param {string} base64 - The base64 string to convert to an array buffer.
 * @returns A Uint8Array
 */
export async function base64ToArrayBuffer(base64: string) {
    var binary_string = base64;
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}