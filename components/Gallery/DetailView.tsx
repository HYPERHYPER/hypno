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
import { getCookie } from "cookies-next";
import axios from "axios";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const { images, isLoading: isLoadingGeneration, textPrompt, editTextPrompt, generateMidjourneyImage } = useMagic(config.ai_generation, asset);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            // Scroll to the element
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
    const enableAiMagic = !asset.mp4_url && config?.ai_generation && config?.ai_generation.enabled;
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
        const updateDownloadedMetadata = async () => {
            const token = String(getCookie('hypno_microsite'));
            if (token) {
                const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/photos/${asset.id}/downloaded`;
                try {
                    await axios.put(url, null, {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }).then(res => console.log(res.data));
                } catch (e) {
                    console.log('Error updating downloaded metadata', e)
                }
            }
        }

        return (asset.mp4_url && config.qr_asset_download !== 'posterframe') ?
            <a
                className={className}
                href={asset.download_url}
                onClick={updateDownloadedMetadata}
                style={style}>
                {text}
            </a>
            :
            <button
                style={style}
                className={className}
                onClick={() => {
                    downloadPhoto(asset, config.qr_asset_download == 'posterframe');
                    updateDownloadedMetadata();
                }}
            >{text}</button>
    }

    return (
        <>
            <div
                style={!_.isEmpty(images) ? {} : (isPortrait && !isVideo) ? { minHeight: isPortrait ? Math.max(Number(height.split('px')[0]), assetHeight) + 'px' : height } : (!isVideo && Number(width) < 668 ? { minHeight: '55vh' } : {})}
                className={clsx(
                    `inline-flex px-[25px] items-center flex-col mx-auto w-full`,
                    _.isEmpty(images) && (isPortrait && assetHeight > Number(height.split('px')[0]) ? 'justify-between sm:justify-start' : (!isPortrait ? 'justify-center' : 'justify-start pb-[30px]')),
                    footer ? (_.isEmpty(images) ? 'mb-[72px]' : '') : ''
                )}>
                <div className={clsx(
                    'relative',
                    isPortrait && 'md:max-w-lg sm:mb-0',
                    isPortrait && !isVideo && _.isEmpty(images) && assetHeight > Number(height.split('px')[0]) && "mb-[72px]",
                )}>
                    <div className='absolute w-full h-full min-h-[100px] min-w-[100px] flex itmes-center justify-center'>
                        <Spinner />
                    </div>
                    <div className={clsx(
                        'relative w-fit transition duration-300',
                        (isLoaded || isVideo) ? 'opacity-100' : 'opacity-0 backdrop-blur-[50px]',
                        isVideo && 'sm:mt-7'
                    )}>
                        {asset.mp4_url ? (
                            <VideoAsset src={asset.mp4_url} poster={asset.posterframe} />
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

                {enableAiMagic && (
                    <div ref={containerRef} className="mt-7 w-full h-auto pb-[36px]">
                        {(!_.isEmpty(images)) && (
                            _.map(images, (img, i) => (
                                <MagicImageItem image={img} key={i} updateEditorPrompt={editTextPrompt} />
                            ))
                        )}
                    </div>
                )}

                {enableAiMagic && (
                    <TextPromptEditor
                        onChange={editTextPrompt}
                        textPrompt={textPrompt}
                        generateImage={handleRemix}
                        isGenerating={isLoadingGeneration}
                    />
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