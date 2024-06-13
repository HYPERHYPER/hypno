import _ from "lodash";
import { saveAs } from "file-saver";

/**
 * It takes a width and height and returns a percentage value that represents the height as a
 * percentage of the width
 * @param {number} width - The width of the image.
 * @param {number} height - number - The height of the element
 * @returns A string with the aspect ratio of the image.
 */
export function getAspectRatio(width?: number, height?: number) {
    if (!width || !height) return '';
    const ratio = (width / height);
    return `${ratio}`;
}

export function calculateAspectRatioString(width?: number, height?: number): string {
    if (!width || !height) return '9:16'
    // Calculate the greatest common divisor (GCD) of width and height
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor: number = gcd(width, height);

    // Calculate the aspect ratio
    const aspectWidth: number = width / divisor;
    const aspectHeight: number = height / divisor;

    // Return the aspect ratio as a string
    return `${aspectWidth}:${aspectHeight}`;
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

type AspectRatio = `${number}:${number}`;
/**
 * The function checks if the aspect ratio of an image matches a given target aspect ratio with a
 * tolerance value.
 * @param {number} imageWidth - The width of an image in pixels.
 * @param {number} imageHeight - The height of the image in pixels.
 * @param {any} aspectRatio - The `aspectRatio` parameter is an object with two properties: `width` and
 * `height`. It represents the desired aspect ratio of an image. For example, an aspect ratio of 16:9
 * would be represented as `{ width: 16, height: 9 }`.
 * @returns a boolean value indicating whether the actual aspect ratio of an image (determined by
 * dividing its width by its height) is within a certain tolerance of a target aspect ratio (specified
 * as an object with "width" and "height" properties).
 */
export function isValidAspectRatio(imageWidth: number, imageHeight: number, aspectRatio?: AspectRatio) {
    if (!aspectRatio) return true;
    const parsedAspectRatio = _.split(aspectRatio, ':');
    const tolerance = 0.01; // Tolerance value to account for rounding errors
    const actualAspectRatio = imageWidth / imageHeight;
    const targetAspectRatio = Number(parsedAspectRatio[0]) / Number(parsedAspectRatio[1]);
    return Math.abs(actualAspectRatio - targetAspectRatio) <= tolerance;
}

export function downloadPhoto(asset: any, filetype?: string) {
    const assetUrl = filetype ? asset.urls[filetype] : asset.urls.url;
    const fileName = `hypno-${asset.event_id}-${asset.id}`;
    saveAs(assetUrl, fileName);
}

/**
 * The function `isImageDark` asynchronously determines if an image is light or dark based on its
 * average brightness.
 * @param {string} imageUrl - The `imageUrl` parameter is a string that represents the URL of the image
 * you want to analyze for darkness or lightness. This function uses the luminance formula to calculate
 * the average brightness of the image and then determines if the image is 'dark' or 'light' based on a
 * predefined threshold.
 * @returns The `isImageDark` function returns a Promise that resolves with either `'light'`, `'dark'`,
 * or `null`.
 */
export async function isImageDark(imageUrl?: string): Promise<'light' | 'dark' | null> {
    if (!imageUrl) return null;
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            let sumBrightness = 0;
            for (let i = 0; i < imageData.data.length; i += 4) {
                // Get brightness of each pixel using luminance formula
                const brightness = (0.2126 * imageData.data[i] + 0.7152 * imageData.data[i + 1] + 0.0722 * imageData.data[i + 2]);
                sumBrightness += brightness;
            }
            // Calculate average brightness
            const avgBrightness = sumBrightness / (img.width * img.height);
            // Define a threshold for light and dark images
            const threshold = 128; // Adjust this threshold as needed
            // Resolve with 'light' or 'dark' based on the average brightness
            resolve(avgBrightness < threshold ? 'dark' : 'light');
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = imageUrl;
    });
}