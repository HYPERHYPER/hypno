import { ReactNode } from "react";
import _ from 'lodash';
import parse from 'html-react-parser';

/**
 * It takes a string and an array of objects, and replaces the text in the string with a link to the
 * url in the object
 * @param {string} text - The text that you want to parse.
 * @param {Link[]} links - Link[]
 * @returns A function that takes in a string and an array of links and returns a ReactNode.
 */
type Link = {
    text: string;
    url: string;
}
export const parseLink = (text: string, links: Link[]): any => {
    let elem = text;
    _.forEach(links, (v) => {
        elem = _.replace(elem, v.text, `<a className='text-white' href=${v.url} rel="noreferrer" target='_blank'>${v.text}</a>`)
    });
    const reactElement = parse(elem);
    return reactElement;
};

/**
 * It takes a string, finds all the links in it, and replaces them with React elements
 * @param {string} text - The text that you want to replace the links in.
 * @returns A React element.
 */
export const replaceLinks = (text: string): any => {
    if (!text) return;
    const pattern = /<([^|]+)\|([^>]+)>/g;
    const replacedText = text.replace(pattern, `<a href="$2" className='text-white' rel="noreferrer" target='_blank'>$1</a>`)
    const reactElement = parse(replacedText)
    return reactElement;
};

/**
 * This function takes a URL string and returns the filename by splitting the URL and returning the
 * last part.
 * @param {string} url (https://admin-web-assets.s3.amazonaws.com/{eventId}/{filename}) - The `url` parameter is a string representing a URL from which we want to
 * extract the filename.
 * @returns the filename extracted from the input URL
 */
export const getFilename = (url: string): any => {
    if (!url) return "";
    // Split the URL by "/"
    const url_parts = String(url).split("/")
    // The last part of the URL should be the filename
    const filename = url_parts[url_parts.length - 1]
    
    return filename;
};

export const getNestedFormField = (baseKey: string, subKey: string): string => {
    return `${baseKey}.${subKey}`;
}

export const getS3Filename = (userId: string, type: 'watermark' | 'logo' | 'background' | 'filter' | 'user', fileName: string, dimensions?: string): string => {
    if (!fileName) return "";
    let filenameWithDimensions = fileName.replaceAll(" ", "-");
    // if (dimensions) {
    //     const aspectRatio = dimensions.replace(':','x');
    //     const fileExtension = _.last(fileName.split('.'));
    //     const fileNameWithoutExtension = fileExtension ? filenameWithDimensions.slice(0, -fileExtension.length - 1) : filenameWithDimensions;
    //     filenameWithDimensions = `${fileNameWithoutExtension}_${aspectRatio}.${fileExtension}`;
    // }
    return `${userId}/${type}/${filenameWithDimensions}`;
};