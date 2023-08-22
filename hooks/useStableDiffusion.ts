import * as Generation from "@/lib/generation/generation_pb";
import { client, metadata } from '@/lib/stabilityClient';
import {
    buildGenerationRequest,
    executeGenerationRequest,
    onGenerationComplete,
} from "../helpers/stableDiffusion";
import { useState } from "react";
import _ from 'lodash';
import { arrayBufferToBase64 } from "@/helpers/image";


export const useStableDiffusion = () => {
    const [output, setOutput] = useState<string | string[]>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const upscaleImage = ({ imageBuffer }: { imageBuffer: Buffer }) => {
        setIsLoading(true);
        const request = buildGenerationRequest("esrgan-v1-x2plus", {
            type: "upscaling",
            upscaler: Generation.Upscaler.UPSCALER_ESRGAN,
            initImage: imageBuffer,
        });

        executeGenerationRequest(client, request, metadata)
            .then((res) => {
                const imageDataUrls = onGenerationComplete(res);
                setOutput(`data:image/png;base64,${_.first(imageDataUrls)}` || '');
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Failed to upscale image:", error);
            });
    }

    const generateImgToImgREST = async ({ url, text_prompt, image_strength }: { url: string, text_prompt: string, image_strength: number }) => {
        setIsLoading(true);
        const response = await fetch('/api/stablediffusion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text_prompt,
                init_image_url: url,
                image_strength
            }),
        });

        if (response.ok) {
            const responseJSON = await response.json();
            setOutput(`data:image/png;base64,${responseJSON.artifacts[0].base64}`);
            setIsLoading(false);
            // responseJSON.artifacts.forEach((image: any, index: number) => {
            //     // Handle saving images here (browser-safe approach)
            //     const blob = new Blob([Buffer.from(image.base64, 'base64')], {
            //         type: 'image/png',
            //     });
            //     const imageURL = URL.createObjectURL(blob);
            //     const a = document.createElement('a');
            //     a.href = imageURL;
            //     a.download = `img2img_${image.seed}.png`;
            //     a.click();
            //     URL.revokeObjectURL(imageURL);
            // });
            // setImageUrl(data[0]);
        } else {
            setIsLoading(false);
            console.error('Error:', response.statusText);
        }
    }

    const generateImgToImg = ({ imageBuffer, prompt, seed, imageStrength = 0.5, upscale = true }: { imageBuffer: Buffer, prompt: string, seed?: number, imageStrength?: number, upscale?: boolean }) => {
        setIsLoading(true);
        // DreamStudio uses an Image Strength slider to control the influence of the initial image on the final result.
        // This "Image Strength" is a value from 0-1, where values close to 1 yield images very similar to the init_image
        // and values close to 0 yield imges wildly different than the init_image. This is just another way to calculate
        // stepScheduleStart, which is done via the following formula: stepScheduleStart = 1 - imageStrength.  This means
        // an image strength of 35% would result in a stepScheduleStart of 0.65.
        //stable-diffusion-xl-1024-v1-0
        //stable-diffusion-512-v2-1
        const request = buildGenerationRequest("stable-diffusion-xl-1024-v1-0", {
            type: "image-to-image",
            prompts: [
                {
                    text: prompt,
                },
            ],
            stepScheduleStart: 1 - imageStrength,
            initImage: imageBuffer,
            seed,
            width: 1024,
            height: 1024,
            samples: 1,
            cfgScale: 8,
            steps: 30,
            sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
        });

        executeGenerationRequest(client, request, metadata)
            .then((res) => {
                const imageDataUrls = onGenerationComplete(res);
                setOutput(`data:image/png;base64,${_.first(imageDataUrls)}` || '');
                if (_.first(imageDataUrls) && upscale) {
                    const buffer = Buffer.from(_.first(imageDataUrls) || '', "base64")
                    upscaleImage({ imageBuffer: buffer })
                }
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("Failed to make image-to-image request:", error);
                setIsLoading(false);
            });
    }

    const generateTextInpainting = async ({ imageBuffer, objectToReplace, replaceWith }: { imageBuffer: number[], objectToReplace: string, replaceWith: string }) => {
        setIsLoading(true);
        const b64 = arrayBufferToBase64(imageBuffer);
        const prefix = 'data:image/png;base64,'
        const b64Url = prefix + b64;

        const res = await fetch("/api/hugging", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: "https://nielsr-text-based-inpainting.hf.space/run/predict",
                data: [
                    b64Url,
                    objectToReplace,
                    replaceWith,
                ]
            }),
        });

        await res.json().then((val) => {
            setOutput(_.first(val.data));
            setIsLoading(false);
        });
    }

    const generateSegmentationMask = async ({ imageBuffer, toIdentify, toIgnore, threshold }: { imageBuffer: number[], toIdentify: string, toIgnore: string, threshold: number }) => {
        setIsLoading(true);
        const b64 = arrayBufferToBase64(imageBuffer);
        const prefix = 'data:image/png;base64,'
        const b64Url = prefix + b64;
        const res = await fetch("/api/hugging", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: "https://sessex-clipseg2.hf.space/run/mask",
                data: [
                    b64Url,
                    toIdentify,
                    toIgnore,
                    threshold
                ]
            }),
        });

        await res.json().then((val) => {
            setOutput(val.data);
            setIsLoading(false);
        });
    }

    return {
        output,
        generateImgToImgREST,
        generateImgToImg,
        generateTextInpainting,
        generateSegmentationMask,
        isLoading,
    }
}