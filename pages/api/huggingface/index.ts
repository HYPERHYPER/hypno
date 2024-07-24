import { NextApiRequest, NextApiResponse } from 'next';
import { HfInference } from '@huggingface/inference';
import { blobToBase64 } from '@/helpers/image';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Create your Hugging Face Token: https://huggingface.co/settings/tokens
        // Set your Hugging Face Token: https://scrimba.com/dashboard#env
        // Learn more: https://scrimba.com/links/env-variables
        // HuggingFace.js Inference docs
        // https://huggingface.co/docs/huggingface.js/inference/README

        const hf = new HfInference(process.env.HF_TOKEN);
        const { oldImageUrl, prompt, model } = req.body;

        console.log(model)
        const oldImageResponse = await fetch(oldImageUrl);
        const oldImageArrayBuffer = await oldImageResponse.arrayBuffer();
        const oldImageBase64 = Buffer.from(oldImageArrayBuffer).toString('base64');

        const newImageResponse = await hf.request({
            model,
            inputs: oldImageBase64,
            parameters: {
                prompt: prompt,
                negative_prompt: "text, bad anatomy, blurry, low quality",
                strength: 0.85,
            }
        }, { taskHint: 'image-to-image' });

        const newImageBase64 = await blobToBase64(newImageResponse as Blob);
        res.status(200).json({ src: newImageBase64 });
    } catch (error: any) {
        console.error('Error generating image:', error.message);
        res.status(500).json({ message: error.message });
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