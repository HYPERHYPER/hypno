import _ from "lodash";
import {saveAs} from "file-saver";

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

export function calculateAspectRatioString(width: number, height: number): string {
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

export function downloadPhoto(asset: any) {
    const assetUrl = asset.urls.url;
    const fileName = `hypno-${asset.event_id}-${asset.id}`;
    saveAs(assetUrl, fileName);
}