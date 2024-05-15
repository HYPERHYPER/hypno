import { AiConfig } from "@/types/event";
import { useState } from "react";
import _ from 'lodash';
import { calculateAspectRatioString } from "@/helpers/image";

export interface MagicImage {
    src?: string;
    status?: string;
    textPrompt?: string;
    urls?: string[];
}

const sleep = (ms: number | undefined) => new Promise((r) => setTimeout(r, ms));

export default function useMagic(config: AiConfig, asset: any) {
    const [images, setImages] = useState<MagicImage[]>([]); // array of generated image urls, if still loading will be empty string
    const [textPrompt, setTextPrompt] = useState<string>(config?.text_prompt || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const editTextPrompt = (updatedText: string) => setTextPrompt(updatedText);

    const customModel = _.find(config?.custom?.models, m => (m.id === config.custom?.current) && m.lora_url)

    // Custom 
    async function generateCustomModelImage() {
        setIsLoading(true);
        const defaultMagicImage = {
            src: '',
            status: 'pending',
            textPrompt
        }
        setImages((prev) => [...prev, defaultMagicImage]) // image generating in progress

        const response = await fetch("/api/predictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: {
                    image: `${asset.urls.url}?width=512`,
                    lora_weights: customModel?.lora_url || '',
                    prompt: `a photo in the style of TOK, ${textPrompt}`,
                    refine: "base_image_refiner",
                    img2img: false,
                    strength: 0.71,
                    scheduler: "K_EULER",
                    lora_scale: 0.95,
                    num_outputs: 4,
                    refine_steps: 30,
                    guidance_scale: 6.32,
                    apply_watermark: true,
                    condition_scale: 1.5,
                    num_inference_steps: 40
                }
            }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
            setError(true);
            console.log('Error generating custom model img:', prediction.detail);
            return;
        }

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                console.log('Error', prediction.detail);
                return;
            }

            const magicImage: MagicImage = {
                src: _.first(prediction.output),
                status: prediction.status,
                textPrompt,
                urls: prediction.output,
            }
            setImages((prev) => [...prev.slice(0, -1), magicImage]); // replace with loaded url
            setIsLoading(false);
            console.log('Completed image details', prediction);
        }
    }

    // Stable diffusion
    async function generateStableDiffusionImage() {
        setIsLoading(true);
        const defaultMagicImage = {
            src: '',
            status: 'pending',
            textPrompt
        }
        setImages((prev) => [...prev, defaultMagicImage]) // image generating in progress

        const response = await fetch("/api/predictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: 'sdxl',
                input: {
                    image: `${asset.urls.url}?width=512`,
                    prompt: textPrompt,
                }
            }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
            setError(true);
            console.log('Error generating custom model img:', prediction.detail);
            return;
        }

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                console.log('Error', prediction.detail);
                return;
            }

            const magicImage: MagicImage = {
                src: _.first(prediction.output),
                status: prediction.status,
                textPrompt,
                urls: prediction.output,
            }
            setImages((prev) => [...prev.slice(0, -1), magicImage]); // replace with loaded url
            setIsLoading(false);
            console.log('Completed image details', prediction);
        }
    }

    // Midjourney
    async function generateMidjourneyImage() {
        setIsLoading(true);

        const defaultMagicImage = {
            src: '',
            status: 'pending',
            textPrompt
        }
        setImages((prev) => [...prev, defaultMagicImage]) // image generating in progress

        const img_prompts = _.join(config?.img_prompt, " ");
        const imgAspectRatioParam = `--ar ${calculateAspectRatioString(asset?.width, asset?.height)}`
        const parameters = _.isNil(config?.midjourney_parameters) ? '' : config?.midjourney_parameters;
        const data = {
            prompt: `${asset.urls.url} ${img_prompts} ${textPrompt} ${imgAspectRatioParam} ${parameters} --cref ${asset.urls.url} --sref ${asset.urls.url}`
        };

        let promptResponseData: any;
        try {
            const response = await fetch('/api/imagine', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: data.prompt })
            });

            if (response.ok) {
                promptResponseData = await response.json();
                console.log(promptResponseData);

                const intervalId = setInterval(async function () {
                    try {
                        console.log('Checking image details');
                        const response = await fetch(`/api/imagine/${promptResponseData.data.id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        })

                        const responseData = await response.json();
                        if (responseData.data.status === 'completed' || responseData.data.status === 'failed') {
                            // stop repeating
                            clearInterval(intervalId);
                            const imageGrid = responseData.data.url;
                            const upscaledImage = _.first(responseData.data.upscaled_urls);
                            const image = upscaledImage || imageGrid;
                            const magicImage = {
                                src: image,
                                status: responseData.data.status,
                                textPrompt,
                                urls: responseData.data.upscaled_urls,
                            }
                            setImages((prev) => [...prev.slice(0, -1), magicImage]); // replace with loaded url
                            setIsLoading(false);
                            console.log('Completed image details', responseData.data);
                        } else {
                            console.log("Image is not finished generation. Status: ", responseData.data.status)
                        }
                    } catch (error) {
                        console.error('Error getting updates', error);
                        throw error;
                    }
                }, 5000 /* every 5 seconds */);
            }
        } catch (error) {
            console.error('Error generating image:', error);
            setError(true);
            setIsLoading(false);
            throw error;
        }
    }

    const generateAiImage = () => {
        switch (config.type) {
            case "custom": return generateCustomModelImage();
            case "midjourney": return generateMidjourneyImage();
            default: return generateStableDiffusionImage();
        }
    }

    return {
        images,
        textPrompt,
        isLoading,
        error,
        editTextPrompt,
        generateMidjourneyImage,
        generateAiImage,
    }
}