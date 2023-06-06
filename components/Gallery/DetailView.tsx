import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import { ThreeDots } from "react-loader-spinner";
import Image from 'next/image';
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import VideoAsset from "./VideoAsset";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);

    const { output, generateImgToImg, generateTextInpainting, isLoading: isLoadingGeneration } = useStableDiffusion();
    const handleRemix = async (e: any) => {
        // e.preventDefault();
        if (config.aiGeneration) {
            const buffer = await fetch(`/api/file?url=${asset.url}`)
                .then((res) => res.json())
                .then((data) => {
                    return data.data
                })

            const { prompt, seed, imageStrength } = config.aiGeneration;
            switch (config.aiGeneration.type) {
                case 'img2img': {
                    generateImgToImg({ imageBuffer: buffer, prompt, seed: seed || undefined, imageStrength });
                    return;
                }
            }
        }
    }

    return (
        <>
            <div
                className={clsx(`max-w-none sm:max-w-lg sm:mx-auto px-[25px]`, footer ? 'mb-[72px]': 'mb-6')}>
                <div className='relative backdrop-blur-[50px]'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                        <Spinner />
                    </div>

                    {asset.mp4_url ? (
                        <VideoAsset src={asset.mp4_url} poster={asset.posterframe} />
                    ) : (
                        <div className='block overflow-hidden'>
                            <Image
                                {...imageProps}
                                priority
                                fill={!imageProps.width}
                                src={asset.url}
                                alt={asset.event_name + asset.id}
                                placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                className={`w-full h-auto`} />
                        </div>
                    )}
                </div>

                        <div className='hidden sm:block sm:mt-3 sm:text-center'>
                            <a className='btn btn-primary btn-gallery locked sm:max-w-sm' href={asset.download_url}>download ↓</a>
                            {(config?.aiGeneration && config.aiGeneration.enabled) && (
                                <label htmlFor="my-modal" className='btn btn-info btn-gallery locked' onClick={handleRemix}>
                                    {isLoadingGeneration ?
                                        <ThreeDots
                                            height="10"
                                            width="30"
                                            radius="4"
                                            color="#FFFFFF"
                                            ariaLabel="three-dots-loading"
                                            visible={true}
                                        /> : 'remix ☢︎'}
                                </label>
                            )}
                        </div>
                    </div>

                    <div className='hidden sm:block sm:mt-3 sm:text-center'>
                        <a className='btn btn-primary btn-gallery locked sm:max-w-sm' href={asset.download_url}>download ↓</a>
                        {(config?.aiGeneration && config.aiGeneration.enabled) && (
                            <label htmlFor="my-modal" className='btn btn-info btn-gallery locked' onClick={handleRemix}>
                                {isLoadingGeneration ?
                                    <ThreeDots
                                        height="10"
                                        width="30"
                                        radius="4"
                                        color="#FFFFFF"
                                        ariaLabel="three-dots-loading"
                                        visible={true}
                                    /> : 'remix ☢︎'}
                            </label>
                        )}
                    </div>
                </div>
            </div>

            <div className='block sm:hidden'>
                <a className='btn btn-primary btn-gallery locked' href={asset.download_url}>download ↓</a>
            </div>

            <input type="checkbox" id="my-modal" className="modal-toggle" />
            <label htmlFor="my-modal" className="modal h-screen mt-0 backdrop-blur-[30px]">
                <label htmlFor='' className="modal-box bg-transparent shadow-none sm:max-w-5xl">
                    <div className='relative bg-white/10 backdrop-blur-[50px] aspect-square w-auto max-h-[75vh] sm:h-[75vh] mx-auto'>
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                            <Spinner />
                        </div>

                        <div className='block'>
                            <img src={String(output)} alt={asset.event_name + asset.id} className='max-h-[75vh] w-auto sm:min-w-[512px] sm:h-[75vh]' />
                        </div>
                    </div>
                </label>
            </label>
        </>
    )
}