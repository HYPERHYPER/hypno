import Hashids from 'hashids';

const SALT = 'r0uAt-J21VhOsybsR0uHJA==';
const PADDING = 6;

/**
 * The hashEncode function encodes a given string using Hashids with a specified salt and padding.
 * @param {string} [to_encode] - The `to_encode` parameter is the string that you want to encode using
 * the Hashids library. This string will be encoded into a hash using the specified salt and padding
 * values.
 * @returns The `hashEncode` function is returning the encoded value of the input string `to_encode`
 * using Hashids with the specified salt and padding.
 */
export const hashEncode = (to_encode?: string) => {
    if (!to_encode) return;
    const hashids = new Hashids(SALT, PADDING);
    const encoded = hashids.encode(to_encode);
    console.log('encoding==>', encoded);
    return encoded;
}


/**
 * The function hashDecode decodes a hashed string using Hashids with a specified salt and padding.
 * @param {string} [to_decode] - The `to_decode` parameter in the `hashDecode` function is a string
 * that represents the encoded hash value that you want to decode using Hashids.
 * @returns The `hashDecode` function is returning the decoded value of the input `to_decode` string
 * using Hashids with the provided salt and padding.
 */
export const hashDecode = (to_decode?: string) => {
    if (!to_decode) return;
    const hashids = new Hashids(SALT, PADDING)
    const decoded = hashids.decode(to_decode)[0];
    console.log('decoded==>', decoded);
    return decoded;
}