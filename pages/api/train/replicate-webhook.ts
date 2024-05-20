// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    console.log("replicate-webhook", req.body)
    const prediction = req.body;
    if (prediction.status == 'succeeded') {
        // await uploadToS3()
        // await saveS3UrlToDatabase()
    }
    return res.end(JSON.stringify(req.body));
}
