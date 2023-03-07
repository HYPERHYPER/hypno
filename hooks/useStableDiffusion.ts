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
    const [output, setOutput] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const generateImgToImg = ({ imageBuffer, prompt, seed, imageStrength = 0.5 }: { imageBuffer: Buffer, prompt: string, seed?: number, imageStrength?: number }) => {
        setIsLoading(true);
        // DreamStudio uses an Image Strength slider to control the influence of the initial image on the final result.
        // This "Image Strength" is a value from 0-1, where values close to 1 yield images very similar to the init_image
        // and values close to 0 yield imges wildly different than the init_image. This is just another way to calculate
        // stepScheduleStart, which is done via the following formula: stepScheduleStart = 1 - imageStrength.  This means
        // an image strength of 35% would result in a stepScheduleStart of 0.65.
        const request = buildGenerationRequest("stable-diffusion-512-v2-1", {
            type: "image-to-image",
            prompts: [
                {
                    text: prompt,
                },
            ],
            stepScheduleStart: 1 - imageStrength,
            initImage: imageBuffer,
            seed,
            width: 256,
            height: 256,
            samples: 1,
            cfgScale: 8,
            steps: 25,
            sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
        });

        executeGenerationRequest(client, request, metadata)
            .then((res) => {
                const imageDataUrls = onGenerationComplete(res);
                setOutput(`data:image/png;base64,${_.first(imageDataUrls)}` || '');
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
        const b64Url = prefix+b64;
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

    return {
        output,
        generateImgToImg,
        generateTextInpainting,
        isLoading,
    }
}