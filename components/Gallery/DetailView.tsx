import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import Image from 'next/image';
import { useState } from "react";
import clsx from "clsx";
import VideoAsset from "./VideoAsset";
import useContentHeight from "@/hooks/useContentHeight";
import _ from 'lodash';
import { toTextColor } from "@/helpers/color";
import useWidth from "@/hooks/useWidth";
import { downloadPhoto } from "@/helpers/image";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const { output, generateImgToImgREST, isLoading: isLoadingGeneration } = useStableDiffusion();
    const handleRemix = async (e: any) => {
        // window.ai_generation_modal.showModal();
        generateImgToImgREST({
            url: asset.urls.url,
            text_prompt: config.aiGeneration.text_prompt,
            image_strength: Number(config.aiGeneration.image_strength) / 100
        })
    };

    const isPortrait = asset.height > asset.width;
    const isVideo = !_.isEmpty(asset.mp4_url);
    const height = useContentHeight({ footer });
    const outerHeight = useContentHeight({ footer: false });
    const width = useWidth();
    const btnColor = config?.color === '#00FF99' ? null : config.color;
    // portrait
    // mobile
    // desktop

    // landscape
    // fill width
    // centered

    const downloadButton = ({ mobile }: { mobile: boolean }) => {
        const className = `btn btn-primary btn-gallery locked ${!mobile ? 'sm:max-w-sm' : ''}`;
        const style = btnColor ? { backgroundColor: btnColor, borderColor: btnColor, color: toTextColor(btnColor) } : {};
        const text = 'download ↓'
        return asset.mp4_url ? <a className={className} href={asset.download_url} style={style}>{text}</a> : <button style={style} className={className} onClick={() => downloadPhoto(asset)}>{text}</button>
    }

    return (
        <>
            <div
                style={output ? {} : (!isVideo && isPortrait) ? { minHeight: isPortrait ? Math.max(Number(height.split('px')[0]), assetHeight) + 'px' : height } : (!isVideo && Number(width) < 668 ? { minHeight: '55vh' } : {})}
                className={clsx(`inline-flex px-[25px] items-center flex-col mx-auto w-full`, isPortrait && assetHeight > Number(height.split('px')[0]) ? 'justify-between' : (!isPortrait ? 'justify-center' : 'justify-start pb-[30px]'), footer ? 'mb-[72px]' : '')}>
                {/* className={clsx(`
                max-w-none sm:max-h-[80vh] sm:w-auto sm:flex sm:items-center sm:justify-center sm:mx-auto px-[25px]`, footer ? 'mb-[72px]': 'mb-6')}> */}
                <div className={clsx('relative', isPortrait && 'md:max-w-lg sm:mb-0', isPortrait && !isVideo && !output && assetHeight > Number(height.split('px')[0]) && "mb-[72px]")}>
                    <div className='absolute w-full h-full min-h-[100px] min-w-[100px] flex itmes-center justify-center'>
                        <Spinner />
                    </div>
                    <div className={clsx('relative w-fit transition duration-300', (isLoaded || isVideo) ? 'opacity-100' : 'opacity-0 backdrop-blur-[50px]')}>
                        {asset.mp4_url ? (
                            <VideoAsset src={asset.mp4_url} poster={asset.posterframe} style={isPortrait && Number(width) > 668 ? { height: 'auto', minHeight: height } : {}} />
                        ) : (
                            <div className='block'>
                                {/* <img
                                    //@ts-ignore
                                    onLoad={(e) => {setAssetHeight(e.target.height); setIsLoaded(true);}}
                                    //@ts-ignore
                                    onResize={(e) => setAssetHeight(e.target.height)}
                                    src={asset.urls.url}
                                    alt={`${asset.event_id}-${asset.id}`}
                                    style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                    className={isPortrait ? `w-auto h-auto` : `w-full h-auto sm:max-h-[70vh]`} />
                             */}
                                <Image
                                    {...imageProps}
                                    onLoadingComplete={() => setIsLoaded(true)}
                                    //@ts-ignore
                                    onLoad={(e) => setAssetHeight(e.target.height)}
                                    //@ts-ignore
                                    onResize={(e) => setAssetHeight(e.target.height)}
                                    priority
                                    fill={!imageProps.width}
                                    src={asset.urls.url}
                                    alt={`${asset.event_id}-${asset.id}`}
                                    placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                    style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                    className={isPortrait ? `w-auto h-auto` : `w-full h-auto sm:max-h-[70vh]`} />
                            </div>
                        )}
                    </div>
                </div>

                {(output || isLoadingGeneration) && (
                    <div className={clsx('relative mt-4 bg-white/10 backdrop-blur-[50px] mx-auto', isLoadingGeneration ? 'w-auto aspect-square' : 'w-auto')}>
                        {isLoadingGeneration && (
                            <div className='absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                                <span className="loading loading-spinner text-secondary" />
                            </div>
                        )}

                        <div className='block'>
                            {output && !isLoadingGeneration && <img style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                src={String(output)} alt={`output-${asset.event_id}-${asset.id}`} className='w-auto' />}
                        </div>
                    </div>
                )}

                <div className='hidden sm:block sm:mt-3 sm:text-center'>
                    {((!asset.mp4_url && config?.aiGeneration && config?.aiGeneration.enabled)) ? (
                        <button className='btn btn-secondary btn-gallery locked' onClick={handleRemix}>
                            {isLoadingGeneration ?
                                <span className="loading loading-dots" />
                                : '✦ tap for magic ✦'}
                        </button>
                    ) : (
                        downloadButton({ mobile: false })
                    )}
                </div>
            </div>



            <div className='block sm:hidden'>
                {((!asset.mp4_url && config?.aiGeneration && config?.aiGeneration.enabled)) ? (
                    <button className='btn btn-secondary btn-gallery locked overflow-hidden relative' onClick={handleRemix}>
                        {isLoadingGeneration ?
                            <span className="loading loading-dots" />
                            : <div className="block absolute overflow-hidden animate-marquee whitespace-nowrap w-[207%]">
                                <span className="float-left w-1/2">tap for magic ✺︎ tap for magic ✦ tap for magic ✶︎ tap for magic ❊</span>
                                <span className="float-left w-1/2">tap for magic ✺︎ tap for magic ✦ tap for magic ✶︎</span>
                            </div>}
                    </button>
                ) :
                    downloadButton({ mobile: true })
                }
            </div>
        </>
    )
}