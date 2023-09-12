import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs';
import path from 'path';
import sharp from "sharp";


export async function loadImageFromURL(url: string, width?: number, height?: number) {
    const w = width || 512;
    const h = height || 512;
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    const buffer = Buffer.from(data);    
    const compressedBuffer = await sharp(buffer)
      .resize(w, h, { fit: 'contain' })
      .jpeg({ quality: 80 })
      .toBuffer();
      return compressedBuffer;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const { url } = req.query;
    const data = await loadImageFromURL(String(url));
    res.status(200).json(data);
}
