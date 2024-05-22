// pages/api/proxy-images.ts

import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { url } = req.query;

    try {
        if (!url) {
            throw new Error('Image URLs are required');
        }

        // Fetch images from their original sources
        const imageData = await fetchImage(String(url));

        // Set appropriate response headers
        res.setHeader('Content-Type', 'image/png');

        // Forward the fetched images as the response
        res.status(200).send(imageData);
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
