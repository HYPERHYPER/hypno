import Spinner from "../Spinner";
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import VideoAsset from "./VideoAsset";
import useContentHeight from "@/hooks/useContentHeight";
import _ from 'lodash';
import { toTextColor } from "@/helpers/color";
import useWidth from "@/hooks/useWidth";
import { downloadPhoto } from "@/helpers/image";
import useMagic from "@/hooks/useMagic";
import MagicButton from "../ImageGeneration/MagicButton";
import MagicImageItem from "../ImageGeneration/ImageAsset";
import { TextPromptEditor } from "../ImageGeneration/EditTextPrompt";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const { images, isLoading: isLoadingGeneration, textPrompt, editTextPrompt, generateMidjourneyImage } = useMagic(config.ai_generation, asset);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            // console.log('height', containerRef.current.scrollHeight)
            // console.log('top', containerRef.current.scrollTop)
            // Scroll to the element
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });

            // Calculate the desired additional scroll amount
            const additionalScrollAmount = 200;

            // Scroll further by the desired amount
            containerRef.current.scrollTo({
                top: containerRef.current.scrollTop + additionalScrollAmount,
                behavior: 'smooth',
            });
        }
    }, [containerRef.current])

    const handleRemix = async (e: any) => {
        // generateImgToImgREST({
        //     url: asset.urls.url,
        //     text_prompt: config.aiGeneration.text_prompt,
        //     image_strength: Number(config.aiGeneration.image_strength) / 100
        // })
        generateMidjourneyImage();
    };

    const imagesLength = _.size(images);
    useEffect(() => {
        scrollToBottom();
    }, [imagesLength])

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
                style={!_.isEmpty(images) ? {} : (!isVideo && isPortrait) ? { minHeight: isPortrait ? Math.max(Number(height.split('px')[0]), assetHeight) + 'px' : height } : (!isVideo && Number(width) < 668 ? { minHeight: '55vh' } : {})}
                className={clsx(
                    `inline-flex px-[25px] items-center flex-col mx-auto w-full`,
                    isPortrait && assetHeight > Number(height.split('px')[0]) ? 'justify-between' : (!isPortrait ? 'justify-center' : 'justify-start pb-[30px]'),
                    footer ? 'mb-[72px]' : '')
                }>
                {/* className={clsx(`
                max-w-none sm:max-h-[80vh] sm:w-auto sm:flex sm:items-center sm:justify-center sm:mx-auto px-[25px]`, footer ? 'mb-[72px]': 'mb-6')}> */}
                <div className={clsx('relative', isPortrait && 'md:max-w-lg sm:mb-0', isPortrait && !isVideo && _.isEmpty(images) && assetHeight > Number(height.split('px')[0]) && "mb-[72px]")}>
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

                <div ref={containerRef} className="mt-7 w-full">
                    {(!_.isEmpty(images)) && (
                        _.map(images, (img, i) => (
                            <MagicImageItem image={img} key={i} updateEditorPrompt={editTextPrompt} />
                        ))
                    )}
                </div>

                {(!asset.mp4_url && config?.ai_generation && config?.ai_generation.enabled) && (
                    <TextPromptEditor onChange={editTextPrompt} textPrompt={textPrompt} generateImage={handleRemix} />
                )}

                <div className='hidden sm:block sm:mt-3 sm:text-center'>
                    {((!asset.mp4_url && config?.ai_generation && config?.ai_generation.enabled)) ? (
                        <MagicButton isLoading={isLoadingGeneration} onClick={handleRemix} />
                    ) : (
                        downloadButton({ mobile: false })
                    )}
                </div>
            </div>



            <div className='block sm:hidden'>
                {((!asset.mp4_url && config?.ai_generation && config?.ai_generation.enabled)) ? (
                    <MagicButton isLoading={isLoadingGeneration} onClick={handleRemix} />
                ) :
                    downloadButton({ mobile: true })
                }
            </div>
        </>
    )
}