import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import { ThreeDots } from "react-loader-spinner";
import Image from 'next/image';
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import VideoAsset from "./VideoAsset";
import useContentHeight from "@/hooks/useContentHeight";
import _ from 'lodash';
import { toTextColor } from "@/helpers/color";
import useWidth from "@/hooks/useWidth";

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

    const isPortrait = asset.height > asset.width;
    const isVideo = !_.isEmpty(asset.mp4_url);
    const height = useContentHeight({ footer });
    const outerHeight = useContentHeight({ footer: false });
    const width = useWidth();
    const btnColor = config?.color === '#000000' ? null : config.color;
    // portrait
    // mobile
    // desktop

    // landscape
    // fill width
    // centered

    return (
        <>
            <div
                style={{ minHeight: isPortrait ? Math.min(Number(height.split('px')[0]), assetHeight) + 'px' : height }}
                className={clsx(`inline-flex px-[25px] items-center flex-col mx-auto w-full`, isPortrait && assetHeight < Number(outerHeight.split('px')[0]) ? 'justify-between' : 'justify-center pb-[30px]', footer ? 'mb-[72px]' : '')}>
                {/* className={clsx(`max-w-none sm:max-h-[80vh] sm:w-auto sm:flex sm:items-center sm:justify-center sm:mx-auto px-[25px]`, footer ? 'mb-[72px]': 'mb-6')}> */}
                <div className={clsx(isPortrait && 'md:max-w-lg sm:mb-0', isPortrait && !isVideo && assetHeight > Number(height.split('px')[0]) && "mb-[72px]")}>
                    <div className='relative backdrop-blur-[50px] w-fit'>
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                            <Spinner />
                        </div>

                        {asset.mp4_url ? (
                            <VideoAsset src={asset.mp4_url} poster={asset.posterframe} style={isPortrait && Number(width) > 668 ? { maxHeight: height } : {}}
                            />
                        ) : (
                            <div className='block'>
                                <Image
                                    {...imageProps}
                                    //@ts-ignore
                                    onLoad={(e) => setAssetHeight(e.target.height)}
                                    //@ts-ignore
                                    onResize={(e) => setAssetHeight(e.target.height)}
                                    priority
                                    fill={!imageProps.width}
                                    src={asset.url}
                                    alt={asset.event_name + asset.id}
                                    placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                    style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                    className={isPortrait ? `w-auto h-full` : `w-full h-auto sm:max-h-[70vh]`} />
                            </div>
                        )}
                    </div>

                    <div className='hidden sm:block sm:mt-3 sm:text-center'>
                        <a className='btn btn-primary btn-gallery locked sm:max-w-sm' href={asset.download_url} style={btnColor ? { backgroundColor: btnColor, borderColor: btnColor, color: toTextColor(btnColor) } : {}}>download ↓</a>
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
                <a className='btn btn-primary btn-gallery locked' href={asset.download_url} style={btnColor ? { backgroundColor: btnColor, borderColor: btnColor, color: toTextColor(btnColor) } : {}}>download ↓</a>
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