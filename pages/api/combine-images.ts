import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { imageUrl, watermarkUrl, blendMode } = req.query;

    if (!imageUrl || !watermarkUrl) {
        return res.status(400).json({ error: 'Missing imageUrl or watermarkUrl' });
    }

    try {
        // Fetch the background image and watermark
        const [imageBuffer, watermarkBuffer] = await Promise.all([
            fetch(imageUrl as string).then(res => res.arrayBuffer()),
            fetch(watermarkUrl as string).then(res => res.arrayBuffer())
        ]);

        // Process the background image
        const image = sharp(Buffer.from(imageBuffer));
        const metadata = await image.metadata();

        // Resize and overlay the watermark
        const watermark = sharp(Buffer.from(watermarkBuffer))
            .resize(metadata.width, metadata.height, { fit: 'cover' });

        // Combine the images
        const compositeImage = await image
            .composite([
                {
                    input: await watermark.toBuffer(),
                    blend: blendMode as sharp.Blend || 'over' // Use 'over' as the default blend mode if not specified
                }
            ])
            .toBuffer();

        // Set the content type and send the image
        res.setHeader('Content-Type', 'image/png');
        res.send(compositeImage);
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).json({ error: 'Error processing images' });
    }
}