import type { NextApiRequest, NextApiResponse } from 'next'

import fetch from 'node-fetch'
import FormData from 'form-data'
import { loadImageFromURL } from '../file'

const engineId = 'stable-diffusion-xl-1024-v1-0'
const apiHost = 'https://api.stability.ai'
const apiKey = process.env.STABILITY_API_KEY

export interface GenerationResponse {
    artifacts: Array<{
        base64: string
        seed: number
        finishReason: string
    }>
}

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<any>
) => {
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

    const { text_prompt, init_image_url, image_strength } = req.body;

    if (!apiKey) throw new Error('Missing Stability API key.')

    const init_image = (await loadImageFromURL(String(init_image_url), 1024, 1024)); // improve dimension check
    const formData = new FormData()
    formData.append('init_image', init_image)
    formData.append('init_image_mode', 'IMAGE_STRENGTH')
    formData.append('image_strength', image_strength)
    formData.append('text_prompts[0][text]', text_prompt)
    formData.append('text_prompts[0][weight]', 1);
    formData.append('text_prompts[1][text]', 'blurry, bad')
    formData.append('text_prompts[1][weight]', -1);
    formData.append('cfg_scale', 7)
    formData.append('clip_guidance_preset', 'FAST_BLUE')
    formData.append('samples', 1)
    formData.append('steps', 30)
    // formData.append('style_preset', 'anime')

    try {
        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/image-to-image`,
            {
                method: 'POST',
                headers: {
                    ...formData.getHeaders(),
                    Accept: 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: formData,
            }
        )

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`)
        }

        const responseJSON = (await response.json()) as GenerationResponse
        res.status(200).json(responseJSON);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default handler;