import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import path from 'path';
import sharp from "sharp";
import { getPlaiceholder } from 'plaiceholder';


export async function getImagePlaceholder(url: string) {
    const placeholder = await getPlaiceholder(url);
    return placeholder;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { url } = req.query;
    const data = await getImagePlaceholder(String(url));
    res.status(200).json(data);
}
