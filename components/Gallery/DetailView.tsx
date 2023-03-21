import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import Spinner from "../Spinner";
import { ThreeDots } from "react-loader-spinner";
import Image from 'next/image';

export default function DetailView({ asset, config, imageProps }: any) {
    const { output, generateImgToImg, generateTextInpainting, isLoading: isLoadingGeneration } = useStableDiffusion();
    const handleRemix = async (e: any) => {
        e.preventDefault();
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
        <div className={`sm:mx-auto h-full mb-[35px] md:px-[90px] w-full flex justify-center flex-col items-center`}>
            <div className='relative bg-white/10 backdrop-blur-[50px] max-h-[75vh]'>
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                    {/* <Spinner /> */}
                </div>

                {asset.mp4_url ? (
                    <div className='block'>
                        <video className='max-w-full max-h-[75vh]' src={asset.mp4_url} autoPlay loop playsInline poster={asset.posterframe} />
                    </div>
                ) : (
                    <div className='block overflow-hidden relative'>
                        <Image 
                            {...imageProps} 
                            alt={asset.event_name + asset.id}
                            placeholder='blur' 
                            className="max-h-[75vh] w-auto" />
                    </div>
                )}
            </div>
            {(isLoadingGeneration || output) && (
                <div className='relative bg-white/10 backdrop-blur-[50px] max-h-[75vh] sm:h-[75vh] mt-8'>
                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                        <Spinner />
                    </div>

                    <div className='block'>
                        <img src={String(output)} alt={asset.event_name + asset.id} className='min-w-[512px] max-h-[75vh] sm:h-[75vh]' />
                        {/* <AutosizeImage
                                        src={photo.url}
                                        alt={photo.event_name + photo.id}
                                    /> */}
                    </div>
                </div>
            )}
            <div className='mt-3 space-x-3'>
                <a className='btn btn-primary' href={asset.download_url}>DOWNLOAD</a>
                {(config?.aiGeneration && config.aiGeneration.enabled) && (
                    <button className='btn btn-info' onClick={handleRemix}>
                        {isLoadingGeneration ?
                            <ThreeDots
                                height="10"
                                width="30"
                                radius="4"
                                color="#FFFFFF"
                                ariaLabel="three-dots-loading"
                                visible={true}
                            /> : 'REMIX'}
                    </button>
                )}
            </div>
        </div>
    )
}