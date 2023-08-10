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
import { downloadPhoto } from "@/helpers/image";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    // const { output, generateImgToImg, generateTextInpainting, isLoading: isLoadingGeneration } = useStableDiffusion();
    // const handleRemix = async (e: any) => {
    //     // e.preventDefault();
    //     if (config.aiGeneration) {
    //         const buffer = await fetch(`/api/file?url=${asset.url}`)
    //             .then((res) => res.json())
    //             .then((data) => {
    //                 return data.data
    //             })

    //         const { prompt, seed, imageStrength } = config.aiGeneration;
    //         switch (config.aiGeneration.type) {
    //             case 'img2img': {
    //                 generateImgToImg({ imageBuffer: buffer, prompt, seed: seed || undefined, imageStrength });
    //                 return;
    //             }
    //         }
    //     }
    // }

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
                style={(!isVideo && isPortrait) ? { minHeight: isPortrait ? Math.max(Number(height.split('px')[0]), assetHeight) + 'px' : height } : (!isVideo && Number(width) < 668 ? { minHeight: '55vh' } : {})}
                className={clsx(`inline-flex px-[25px] items-center flex-col mx-auto w-full`, isPortrait && assetHeight > Number(height.split('px')[0]) ? 'justify-between' : (!isPortrait ? 'justify-center' : 'justify-start pb-[30px]'), footer ? 'mb-[72px]' : '')}>
                {/* className={clsx(`
                max-w-none sm:max-h-[80vh] sm:w-auto sm:flex sm:items-center sm:justify-center sm:mx-auto px-[25px]`, footer ? 'mb-[72px]': 'mb-6')}> */}
                <div className={clsx('relative', isPortrait && 'md:max-w-lg sm:mb-0', isPortrait && !isVideo && assetHeight > Number(height.split('px')[0]) && "mb-[72px]")}>
                    <div className='absolute w-full h-full min-h-[100px] min-w-[100px] flex itmes-center justify-center'>
                        <Spinner />
                    </div>
                    <div className={clsx('relative backdrop-blur-[50px] w-fit transition duration-300', (isLoaded || isVideo) ? 'opacity-100' : 'opacity-0')}>
                        {asset.mp4_url ? (
                            <VideoAsset src={asset.mp4_url} poster={asset.posterframe} style={isPortrait && Number(width) > 668 ? { height: 'auto', minHeight: height } : {}} />
                        ) : (
                            <div className='block'>
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

                    <div className='hidden sm:block sm:mt-3 sm:text-center'>
                        {downloadButton({ mobile: false })}
                        {/* {(config?.aiGeneration && config.aiGeneration.enabled) && (
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
                        )} */}
                    </div>
                </div>
            </div>

            <div className='block sm:hidden'>
                {downloadButton({ mobile: true })}
            </div>

            {/* <input type="checkbox" id="my-modal" className="modal-toggle" />
            <label htmlFor="my-modal" className="modal h-screen mt-0 backdrop-blur-[30px]">
                <label htmlFor='' className="modal-box bg-transparent shadow-none sm:max-w-5xl">
                    <div className='relative bg-white/10 backdrop-blur-[50px] aspect-square w-auto max-h-[75vh] sm:h-[75vh] mx-auto'>
                        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                            <Spinner />
                        </div>

                        <div className='block'>
                            {output && <img src={String(output)} alt={`output-${asset.event_id}-${asset.id}`} className='max-h-[75vh] w-auto sm:min-w-[512px] sm:h-[75vh]' />}
                        </div>
                    </div>
                </label>
            </label> */}
        </>
    )
}