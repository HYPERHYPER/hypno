import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import { ThreeDots } from "react-loader-spinner";
import Image from 'next/image';
import SpeakerOff from '../../public/pop/speaker-off.svg'
import { useCallback, useRef, useState } from "react";
import useContentHeight from "@/hooks/useContentHeight";
import { getAspectRatio } from "@/helpers/image";

export default function DetailView({ asset, config, imageProps }: any) {
    const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const height = useContentHeight({ footer: true });
    const vidRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState<boolean>(true);

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

    const unmuteVideo = useCallback(() => {
        if (vidRef.current) {
            vidRef.current.muted = false;
            setMuted(false);
        }
    }, [vidRef]);

    const aspectRatio = getAspectRatio(asset.metadata.aspect_ratio.split(":")[0], asset.metadata.aspect_ratio.split(":")[1]);
    return (
        <>
            <div
                style={{ height }}
                className={`absolute top-1/2 left-0 right-0 -translate-y-1/2 sm:mx-auto h-[${height}] px-[25px] md:px-[90px] flex flex-1 flex-col justify-center items-center`}>
                <div style={{ aspectRatio }} className='relative backdrop-blur-[50px]'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                        <Spinner />
                    </div>

                    {asset.mp4_url ? (
                        <div className='block relative' style={{ maxHeight: height }}>
                            {muted && (
                                <div className="absolute top-[10px] left-[10px] z-10">
                                    <button onClick={unmuteVideo} className="cursor-pointer w-[35px] h-[35px] sm:w-[50px] sm:h-[50px] btn-circle bg-black flex items-center justify-center"><SpeakerOff /></button>
                                </div>
                            )}
                            <video ref={vidRef} style={{ maxHeight: height }} className='max-w-full max-h-full' src={asset.mp4_url} autoPlay loop playsInline muted poster={asset.posterframe} />
                        </div>
                    ) : (
                        <div className='block overflow-hidden' style={{ maxHeight: height }}>
                            <Image
                                {...imageProps}
                                priority
                                fill={!imageProps.width}
                                src={asset.url}
                                alt={asset.event_name + asset.id}
                                placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                style={{ maxHeight: height }}
                                className={`max-h-[calc(100vh-22vw-22vw-env(safe-area-inset-bottom))] max-h-[${height}] w-auto`} />
                        </div>
                    )}
                </div>

                <div className='hidden sm:block sm:mt-3'>
                    {asset.mp4_url && <a className='btn btn-primary btn-gallery locked' href={asset.download_url}>download ↓</a>}
                    {(!asset.mp4_url && config?.aiGeneration && config.aiGeneration.enabled) && (
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

            <div className='block sm:hidden'>
                {asset.mp4_url && <a className='btn btn-primary btn-gallery locked' href={asset.download_url}>download ↓</a>}
                {(!asset.mp4_url && config?.aiGeneration && config.aiGeneration.enabled) && (
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