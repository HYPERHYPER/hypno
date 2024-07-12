import { AiConfig } from "@/types/event";
import { useState } from "react";
import _ from 'lodash';
import { calculateAspectRatioString } from "@/helpers/image";

export interface MagicImage {
    src?: string;
    status?: string;
    textPrompt?: string;
    urls?: string[];
    progress?: number;
}

const sleep = (ms: number | undefined) => new Promise((r) => setTimeout(r, ms));

const getStatus = (status: string, progress?: number) => {
    if (status == 'pending' || (status == 'in-progress' && (!progress || progress < 50))) {
        return 'generating'
    } else if (status == 'in-progress') {
        return 'finishing'
    } else {
        return status;
    }
}

export default function useMagic(initConfig: AiConfig, initAsset: any) {
    const [config, setConfig] = useState<AiConfig>(initConfig);
    const [asset, setAsset] = useState(initAsset);

    const [images, setImages] = useState<MagicImage[]>([]); // array of generated image urls, if still loading will be empty string
    const addImage = (image: MagicImage) => setImages(prev => [...prev, image]);
    const replaceLastImage = (image: MagicImage) => setImages(prev => [...prev.slice(0, -1), image]);

    const [textPrompt, setTextPrompt] = useState<string>(config?.text_prompt || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const editTextPrompt = (updatedText: string) => setTextPrompt(updatedText);
    const resetImages = () => setImages([]);

    const customModel = config?.custom?.current || null;
    const imageSrc = config.apply_graphics ? asset.raw : `${asset.urls.url}?width=512`;

    function initializeImageGeneration() {
        setIsLoading(true);
        setError(false);
        const defaultMagicImage = {
            src: '',
            status: getStatus('pending'),
            textPrompt
        }
        // check if raw was in progress
        if (_.last(images)?.progress == -1) {
            replaceLastImage(defaultMagicImage)
        } else {
            addImage(defaultMagicImage) // image generating in progress
        }

        return defaultMagicImage;
    }

    // Custom 
    async function generateCustomModelImage() {
        const defaultMagicImage = initializeImageGeneration();

        const response = await fetch("/api/predictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: {
                    prompt: `in the style of TOK, ${textPrompt}`,
                    refine: "no_refiner",
                    scheduler: "K_EULER",
                    lora_scale: 0.8,
                    num_outputs: 1,
                    controlnet_1: "edge_canny",
                    controlnet_2: "depth_leres",
                    // controlnet_2: "illusion",
                    controlnet_3: "none",
                    lora_weights: customModel?.lora_url || '',
                    guidance_scale: 7.5,
                    apply_watermark: false,
                    prompt_strength: 0.8,
                    sizing_strategy: "controlnet_1_image",
                    controlnet_1_end: 1,
                    controlnet_2_end: 1,
                    controlnet_1_image: imageSrc,
                    controlnet_1_start: 0,
                    controlnet_2_image: imageSrc,
                    controlnet_2_start: 0,
                    num_inference_steps: 30,
                    controlnet_1_conditioning_scale: 0.8,
                    controlnet_2_conditioning_scale: 0.8,

                    // https://replicate.com/batouresearch/sdxl-controlnet-lora
                    // image: `${imageSrc}?width=512`,
                    // lora_weights: customModel?.lora_url || '',
                    // prompt: `In the style of TOK, ${textPrompt}`,
                    // refine: "base_image_refiner",
                    // img2img: false,
                    // strength: 0.8,
                    // scheduler: "K_EULER",
                    // lora_scale: 0.95,
                    // num_outputs: 4,
                    // refine_steps: 10,
                    // guidance_scale: 7.5,
                    // apply_watermark: true,
                    // condition_scale: 1.5,
                    // num_inference_steps: 40
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

            const output_urls = _.filter(prediction.output, (o: string) => !o.includes('control'))
            const magicImage: MagicImage = {
                src: _.first(output_urls),
                status: getStatus(prediction.status),
                textPrompt,
                urls: output_urls,
            }
            replaceLastImage(magicImage); // replace with loaded url
            setIsLoading(false);
            console.log('Completed image details', prediction);
        }
    }

    // Stable diffusion
    async function generateStableDiffusionImage() {
        const defaultMagicImage = initializeImageGeneration();

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
        const defaultMagicImage = initializeImageGeneration();

        const img_prompts = _.join(config?.img_prompt, " ");
        const imgAspectRatioParam = `--ar ${calculateAspectRatioString(asset?.width, asset?.height)}`
        const parameters = _.isNil(config?.midjourney_parameters) ? '' : config?.midjourney_parameters;
        const cref = config?.cref ? `--cref ${imageSrc}` : ''
        const sref = config?.sref ? `--sref ${imageSrc}` : ''
        const data = {
            prompt: `${imageSrc} ${img_prompts} ${textPrompt} ${imgAspectRatioParam} ${parameters} ${cref} ${sref}`
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
                        const data = responseData.data;

                        if (data.status === 'completed' || data.status === 'failed') {
                            // stop repeating
                            clearInterval(intervalId);
                            const imageGrid = data.url;
                            const upscaledImage = _.first(data.upscaled_urls);
                            const image = upscaledImage || imageGrid;
                            const magicImage = {
                                src: image,
                                status: getStatus(data.status, data.progress),
                                textPrompt,
                                urls: data.upscaled_urls,
                                progress: data.progress,
                            }
                            replaceLastImage(magicImage) // replace with loaded url
                            setIsLoading(false);
                            console.log('Completed image details', data);
                        } else {
                            console.log("Image is not finished generation. Status: ", data);
                            const magicImage = {
                                ...defaultMagicImage,
                                status: getStatus(data.status, data.progress),
                                progress: data.progress,
                            }
                            replaceLastImage(magicImage);
                        }
                    } catch (error) {
                        console.error('Error getting updates', error);
                        throw error;
                    }
                }, 3000 /* every 5 seconds */);
            }
        } catch (error) {
            console.error('Error generating image:', error);
            setError(true);
            setIsLoading(false);
            throw error;
        }
    }


    async function generateHuggingFaceImage() {
        if (!config.huggingface_model) return;

        const defaultMagicImage = initializeImageGeneration();
        try {
            const response = await fetch('/api/huggingface', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldImageUrl: imageSrc,
                    prompt: textPrompt,
                    model: config.huggingface_model,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate image');
            }

            const data = await response.json();

            const magicImage = {
                src: data.src,
                status: getStatus('succeeded'),
                textPrompt,
            };
            setIsLoading(false);
            replaceLastImage(magicImage);
        } catch (error) {
            console.error('Error generating image:', error);
            setError(true);
            setIsLoading(false);
            // Handle error (e.g., show error message to user)
        }
    }

    const generateAiImage = () => {
        switch (config.type) {
            case "custom": return generateCustomModelImage();
            case "midjourney": return generateMidjourneyImage();
            case "hugging-face": return generateHuggingFaceImage();
            default: return generateStableDiffusionImage();
        }
    };

    return {
        images,
        addImage,
        textPrompt,
        isLoading,
        error,
        editTextPrompt,
        generateMidjourneyImage,
        generateAiImage,
        setAsset,
        setConfig,
        resetImages,
    }
}