import type { NextApiRequest, NextApiResponse } from 'next'

const apiHost = 'https://cl.imagineapi.dev' // new startup account
const apiKey = process.env.IMAGINE_API_TOKEN

const handler = async (
    req: NextApiRequest,
    res: NextApiResponse<any>
) => {
    if (!apiKey) throw new Error('Missing Imagine API key.')

    if (req.method === 'POST') {
        const { prompt } = req.body;
        const data = {
            prompt
        }
        try {
            const response = await fetch(
                `${apiHost}/items/images/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                throw new Error(`Non-200 response: ${await response.text()}`)
            }

            const responseJSON = (await response.json())
            console.log(responseJSON)
            res.status(200).json(responseJSON);
        } catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    else {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }

};

export default handler;