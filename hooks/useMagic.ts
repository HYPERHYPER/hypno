import { AiConfig } from "@/types/event";
import { useState } from "react";
import _ from 'lodash';
import { calculateAspectRatioString } from "@/helpers/image";

export default function useMagic(config: AiConfig, asset: any) {

    const [images, setImages] = useState<string[]>([]); // array of generated image urls, if still loading will be empty string
    const [textPrompt, setTextPrompt] = useState<string>(config?.text_prompt || '');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const editTextPrompt = (updatedText: string) => setTextPrompt(updatedText);

    // Stable diffusion
    async function generateStableDiffusionImage() {

    }

    // Midjourney
    async function generateMidjourneyImage() {
        setIsLoading(true);
        setImages((prev) => [...prev, '']) // image generating in progress

        const img_prompts = _.join(config?.img_prompt, " ");
        const imgAspectRatioParam = `--ar ${calculateAspectRatioString(asset?.width, asset?.height)}`
        const data = {
            prompt: `${asset.urls.url} ${img_prompts} ${textPrompt} ${imgAspectRatioParam} ${config?.midjourney_parameters}`
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
                        setImages((prev) => [...prev.slice(0, -1), image]); // replace with loaded url
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

    return {
        images,
        textPrompt,
        isLoading,
        error,
        editTextPrompt,
        generateMidjourneyImage
    }
}