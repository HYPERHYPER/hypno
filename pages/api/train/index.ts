import type { NextApiRequest, NextApiResponse } from 'next'

// find url
const SAFETENSORS = "b2a308762e36ac48d16bfadc03a65493fe6e799f429f7941639a6acec5b276cc"

// https://replicate.com/zylim0702/sdxl-lora-customize-training
const TRAINED_MODEL_TAR_ID = "2ea90da29b19984472a0bbad4ecb39abe4b91fa0d6a5e8dc59988022149dee55"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: TRAINED_MODEL_TAR_ID,
      input: {
        input_images: req.body.input_images,
        use_face_detection_instead: false,
        token_string: "TOK",
        caption_prefix: "In the style of TOK,",
        ti_lr: 0.0003,
        is_lora: true,
        lora_lr: 0.0004, // speed up learning rate from 0.0001
        verbose: true,
        lora_rank: 32,
        resolution: 1024,
        lr_scheduler: "constant",
        lr_warmup_steps: 100,
        max_train_steps: 1000,
        num_train_epochs: 4000,
        train_batch_size: 4,
        unet_learning_rate: 0.000001,
        checkpointing_steps: 999999,
        clipseg_temperature: 1,
        input_images_filetype: "infer",
        crop_based_on_salience: true,
      },
      // webhook: 'https://2f8b-2603-7000-4340-23bd-d9d2-49ff-35b4-3839.ngrok-free.app/api/train/replicate-webhook',
      // webhook_events_filter: ["completed"]
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