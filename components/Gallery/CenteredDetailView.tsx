import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import Image from 'next/image';
import useContentHeight from "@/hooks/useContentHeight";
import { downloadPhoto, getAspectRatio } from "@/helpers/image";
import VideoAsset from "./VideoAsset";
import _ from "lodash";
import clsx from "clsx";

export default function CenteredDetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const height = useContentHeight({ footer: true });

    const { output, generateImgToImgREST, isLoading: isLoadingGeneration } = useStableDiffusion();
    const handleRemix = async (e: any) => {
        // window.ai_generation_modal.showModal();
        generateImgToImgREST({
            url: asset.urls.url,
            text_prompt: config.aiGeneration.text_prompt,
            image_strength: Number(config.aiGeneration.image_strength) / 100
        })
    };

    const aspectRatio = getAspectRatio(asset.metadata?.aspect_ratio?.split(":")[0], asset.metadata?.aspect_ratio?.split(":")[1]);
    const downloadButton = ({ mobile }: { mobile: boolean }) => {
        const className = `btn btn-primary btn-gallery locked ${!mobile ? 'sm:max-w-sm' : ''}`;
        const text = 'download ↓'
        return asset.mp4_url ? <a className={className} href={asset.download_url}>{text}</a> : <button className={className} onClick={() => downloadPhoto(asset)}>{text}</button>
    }

    return (
        <>
            <div
                style={!output ? { height } : {}}
                className={clsx(`sm:mt-7 sm:mx-auto px-[25px] md:px-[90px]`,
                    !output ?
                        'absolute top-1/2 left-0 right-0 -translate-y-1/2 flex flex-1 flex-col items-center justify-center'
                        : 'pt-[100px] flex flex-col items-center'
                )}
            >
                <div style={{ aspectRatio }} className='relative'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                        <Spinner />
                    </div>

                    {asset.mp4_url ? (
                        <VideoAsset style={{ maxHeight: height }} src={asset.mp4_url} poster={asset.posterframe} />
                    ) : (
                        <div className='block overflow-hidden' style={{ maxHeight: height }}>
                            <img
                                src={asset.urls.url}
                                alt={`${asset.event_id}-${asset.id}`}
                                style={{ maxHeight: height }}
                                className={`max-h-[calc(100vh-22vw-22vw-env(safe-area-inset-bottom))] max-h-[${height}] w-auto`}
                            />
                            {/* <Image
                                {...imageProps}
                                priority
                                fill={!imageProps.width}
                                src={asset.urls.url}
                                alt={`${asset.event_id}-${asset.id}`}
                                placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                style={{ maxHeight: height }}
                                className={`max-h-[calc(100vh-22vw-22vw-env(safe-area-inset-bottom))] max-h-[${height}] w-auto`} /> */}
                        </div>
                    )}
                </div>

                {(output || isLoadingGeneration) && (
                    <div className={clsx('relative mt-4 bg-white/10 backdrop-blur-[50px] sm:h-[75vh] mx-auto', isLoadingGeneration ? 'w-full aspect-square' : 'w-auto')}>
                        {isLoadingGeneration && (
                            <div className='absolute -z-10 -translate-x-1/2 translate-y-1/2'>
                                <span className="loading loading-spinner text-secondary" />
                            </div>
                        )}

                        <div className='block'>
                            {output && !isLoadingGeneration && <img src={String(output)} alt={`output-${asset.event_id}-${asset.id}`} className='max-h-[75vh] w-auto sm:min-w-[512px] sm:h-[75vh]' />}
                        </div>
                    </div>
                )}

                <div className='hidden sm:mt-3 sm:flex sm:justify-center'>
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