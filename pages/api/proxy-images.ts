import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    try {
        if (!url) {
            throw new Error('Image URLs are required');
        }

        // Fetch images from their original sources
        const imageData = await fetchImage(String(url));

        // Check image size
        if (imageData.length > 4 * 1024 * 1024) {
            // Resize and compress the image if it exceeds 4MB
            const resizedImageData = await resizeImage(imageData);
            // Set appropriate response headers
            res.setHeader('Content-Type', 'image/png');
            // Send the resized image data as the response
            res.status(200).send(resizedImageData);
        } else {
            // Set appropriate response headers
            res.setHeader('Content-Type', 'image/png');
            // Forward the fetched image data as the response
            res.status(200).send(imageData);
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function fetchImage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
}

async function resizeImage(imageData: Buffer): Promise<Buffer> {
    // Resize and compress the image using sharp
    const resizedImageBuffer = await sharp(imageData)
        .resize({ width: 1200 }) // Adjust width and height as needed
        .jpeg({ quality: 80 }) // Set JPEG quality (0-100) as needed
        .toBuffer();
    
    return resizedImageBuffer;
}