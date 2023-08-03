import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import { ThreeDots } from "react-loader-spinner";
import Image from 'next/image';
import useContentHeight from "@/hooks/useContentHeight";
import { downloadPhoto, getAspectRatio } from "@/helpers/image";
import VideoAsset from "./VideoAsset";

export default function CenteredDetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const height = useContentHeight({ footer: true });

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

    const aspectRatio = getAspectRatio(asset.metadata?.aspect_ratio?.split(":")[0], asset.metadata?.aspect_ratio?.split(":")[1]);
    const downloadButton = ({ mobile }: { mobile: boolean }) => {
        const className = `btn btn-primary btn-gallery locked ${!mobile ? 'sm:max-w-sm' : ''}`;
        const text = 'download ↓'
        return asset.mp4_url ? <a className={className} href={asset.download_url}>{text}</a> : <button className={className} onClick={() => downloadPhoto(asset)}>{text}</button>
    }

    return (
        <>
            <div
                style={{ height }}
                className={`sm:mt-7 absolute top-1/2 left-0 right-0 -translate-y-1/2 sm:mx-auto h-[${height}] px-[25px] md:px-[90px] flex flex-1 flex-col justify-center items-center`}>
                <div style={{ aspectRatio }} className='relative backdrop-blur-[50px]'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                        <Spinner />
                    </div>

                    {asset.mp4_url ? (
                        <VideoAsset style={{ maxHeight: height }} src={asset.mp4_url} poster={asset.posterframe} />
                    ) : (
                        <div className='block overflow-hidden' style={{ maxHeight: height }}>
                            <Image
                                {...imageProps}
                                priority
                                fill={!imageProps.width}
                                src={asset.urls.url}
                                alt={`${asset.event_id}-${asset.id}`}
                                placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                style={{ maxHeight: height }}
                                className={`max-h-[calc(100vh-22vw-22vw-env(safe-area-inset-bottom))] max-h-[${height}] w-auto`} />
                        </div>
                    )}
                </div>

                <div className='hidden sm:block sm:mt-3'>
                    {downloadButton({mobile: false})}
                    {(!asset.mp4_url && config?.aiGeneration && config?.aiGeneration.enabled) && (
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
                {downloadButton({mobile: true})}
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
                            {output && <img src={String(output)} alt={`output-${asset.event_id}-${asset.id}`} className='max-h-[75vh] w-auto sm:min-w-[512px] sm:h-[75vh]' />}
                        </div>
                    </div>
                </label>
            </label>
        </>
    )
}