import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {


  // Pinned to a specific version of Stable Diffusion
  // See https://replicate.com/stability-ai/sdxl
  // version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
      
  // Lora 
  // See https://replicate.com/cloneofsimo/lora
  // version: "fce477182f407ffd66b94b08e761424cabd13b82b518754b83080bc75ad32466"

  // Controlnet LoRa
  // See https://replicate.com/batouresearch/sdxl-controlnet-lora
  // version: "3bb13fe1c33c35987b33792b01b71ed6529d03f165d1c2416375859f09ca9fef"

  // Realvisxl-v3-multi-controlnet-lora
  // See https://replicate.com/fofr/realvisxl-v3-multi-controlnet-lora
  // version: "90a4a3604cd637cb9f1a2bdae1cfa9ed869362ca028814cdce310a78e27daade"

  const modelId = req.body.model == 'sdxl' ? 
    "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
    :
    "90a4a3604cd637cb9f1a2bdae1cfa9ed869362ca028814cdce310a78e27daade"
    // "3bb13fe1c33c35987b33792b01b71ed6529d03f165d1c2416375859f09ca9fef";

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: modelId,
      // This is the text prompt that will be submitted by a form on the frontend
      input: { 
        ...req.body.input,
        negative_prompt: "(worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch), open mouth, disfigured, deformed, mutilated, mangled, warped, distorted, blurry, crossed eyes, derailed eyes, weird pupils, heterochromia, odd eye colors, extra teeth, no teeth, weird teeth, lopsided mouth, malformed mouth, extra limbs, missing limbs, fused limbs, odd joints, contorted, malformed, disproportionate, unrealistic muscles, odd proportions, artifacts, noise, blurs, glitches, compression, pixelation, jpeg, poorly drawn, rendering issue, rendering failure, worst quality, low quality, bad anatomy, unrealistic body, unrealistic proportions, malformed hands, long neck, bad face, cloned face, cropped, watermarked, text, error, malformed, grotesque, monstrous, deformed, disfigured, mutated, multiple heads, multiple bodies, fused bodies, conjoined, corrupted, broken, wobbly, melting, stretchy, liquified",
        disable_safety_checker: true,
      },
    }),
  });

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}