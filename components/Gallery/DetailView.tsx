import Spinner from "../Spinner";
import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import VideoAsset from "./VideoAsset";
import useContentHeight from "@/hooks/useContentHeight";
import _ from 'lodash';
import { toTextColor } from "@/helpers/color";
import useWidth from "@/hooks/useWidth";
import { downloadPhoto, getAspectRatio } from "@/helpers/image";
import useMagic from "@/hooks/useMagic";
import MagicButton from "../ImageGeneration/MagicButton";
import MagicImageItem from "../ImageGeneration/ImageAsset";
import { TextPromptEditor } from "../ImageGeneration/EditTextPrompt";
import { getCookie } from "cookies-next";
import axios from "axios";
import useImageExistence from "@/hooks/useImageExistence";
import { ImageCacheProvider } from "../ImageCacheContext";

export default function DetailView({ asset, config, imageProps }: any) {
    // const footer = Boolean(config.aiGeneration?.enabled || asset.mp4_url);
    const footer = true; // always show download btn
    const [assetHeight, setAssetHeight] = useState<number>(0);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);

    const {
        images,
        addImage: addMagicImage,
        isLoading: isLoadingGeneration,
        textPrompt,
        editTextPrompt,
        generateAiImage
    } = useMagic({ ...config.ai_generation, apply_graphics: config.rawEnabled }, asset);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = useCallback(() => {
        if (containerRef.current) {
            // Scroll to the element
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [])

    const imagesLength = _.size(images);
    useEffect(() => {
        if (imagesLength > 0) {
            setTimeout(() => {
                scrollToBottom();
            }, 300);
        }
    }, [imagesLength])

    const isPortrait = asset.height > asset.width;
    const displayFileType = config.displayFileType;
    const displayUrl = displayFileType ? asset.urls[displayFileType] : asset.urls.url;
    const isVideo = !_.isEmpty(asset.mp4_url) && (displayFileType ? _.includes(displayFileType, 'mp4') : true);

    const height = useContentHeight({ footer });
    const outerHeight = useContentHeight({ footer: false });
    const width = useWidth();
    const btnColor = config?.color === '#00FF99' ? null : config.color;
    const enableAiMagic = !asset.mp4_url && config?.ai_generation && config?.ai_generation.enabled;

    // get watermark to be applied to image generation
    const aspectRatio = Number(getAspectRatio(asset.width, asset.height))
    // check if apply graphics is turned on (stored in pro_raw_upload) - since watermarks are applied to raw url
    const watermarkUrl = _.first(_.filter(config?.watermarks, (wm) => {
        const w_h = wm.name.split(":")
        const ar = Number(w_h[0]) / Number(w_h[1])
        return ar.toFixed(1) === aspectRatio.toFixed(1)
    }))?.watermark_url;

    const watermark = (config.rawEnabled && watermarkUrl) ? {
        url: watermarkUrl,
        blendmode: config.watermarkBlendmode
    } : undefined;

    // If watermark turned on, wait until raw has uploaded before performing image generation
    const { imageExists : rawImageExists } = useImageExistence(watermark ? asset.raw : '');
    const [clickedMagicButton, setClickedMagicButton] = useState<boolean>(false);

    const handleRemix = () => {
        setClickedMagicButton(true);
        // generateAiImage();
    };

    useEffect(() => {
        // if graphics turned on (depends on watermark variable) 
        // -> check that raw is avail before generating
        if (clickedMagicButton) {
            if ((watermark && rawImageExists) || !watermark) {
                generateAiImage();
                setClickedMagicButton(false);
            } else if (watermark && !rawImageExists) {
                // start fake loading magic image
                addMagicImage({
                    src: '',
                    status: 'uploading raw',
                    progress: -1
                })
            }
        }
    }, [clickedMagicButton, rawImageExists])

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

        const downloadFiletype = config.qr_asset_download == 'posterframe' ? 'posterframe' : (displayFileType || '')
        return (isVideo && config.qr_asset_download !== 'posterframe') ?
            <a
                className={className}
                href={asset.download_url}
                onClick={updateDownloadedMetadata}
                style={style}>
                {text}
            </a>
            :
            <></>
        // <button
        //     style={style}
        //     className={className}
        //     onClick={() => {
        //         downloadPhoto(asset, downloadFiletype);
        //         updateDownloadedMetadata();
        //     }}
        // >{text}</button>
    }

    useEffect(() => {
        const loadImage = () => {
            const img = new window.Image(); // Check if window is defined before using Image constructor
            img.onload = () => {
                setIsLoaded(true);
            };
            img.src = displayUrl;

            // If the image is already loaded before the onload event is attached
            if (img.complete) {
                setIsLoaded(true);
            }
        };

        if (typeof window !== 'undefined') {
            loadImage();
        }
    }, [displayUrl]);

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
                        {isVideo ? (
                            <VideoAsset src={asset.mp4_url} poster={asset.posterframe} />
                        ) : (
                            <div className='block'>
                                <img
                                    {...imageProps}
                                    id='detail-view-image'
                                    // onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {console.log('LOADING'); setAssetHeight(e.currentTarget.height); setIsLoaded(true);}}
                                    onResize={(e: React.SyntheticEvent<HTMLImageElement>) => setAssetHeight(e.currentTarget.height)}
                                    src={displayUrl}
                                    alt={`${asset.event_id}-${asset.id}`}
                                    style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                    className={isPortrait ? `w-auto h-auto` : `w-full h-auto sm:max-h-[70vh]`}
                                />

                                {/* <Image
                                    {...imageProps}
                                    id='detail-view-image'
                                    onLoadingComplete={() => setIsLoaded(true)}
                                    //@ts-ignore
                                    onLoad={(e) => setAssetHeight(e.target.height)}
                                    //@ts-ignore
                                    onResize={(e) => setAssetHeight(e.target.height)}
                                    priority
                                    fill={!imageProps.width}
                                    src={displayUrl}
                                    alt={`${asset.event_id}-${asset.id}`}
                                    placeholder={imageProps?.blurDataURL ? 'blur' : 'empty'}
                                    style={isPortrait && assetHeight > Number(outerHeight.split('px')[0]) ? { minHeight: height } : {}}
                                    className={isPortrait ? `w-auto h-auto` : `w-full h-auto sm:max-h-[70vh]`} /> */}
                            </div>
                        )}
                    </div>
                </div>

                {enableAiMagic && (
                    <ImageCacheProvider>
                        <div className="mt-7 w-full h-auto pb-[36px]">
                            {(!_.isEmpty(images)) && (
                                _.map(images, (img, i) => (
                                    <MagicImageItem
                                        image={img}
                                        watermark={watermark}
                                        key={i}
                                        updateEditorPrompt={editTextPrompt}
                                        enablePromptEditor={config?.ai_generation?.disable_prompt_editor}
                                    />
                                ))
                            )}
                        </div>
                    </ImageCacheProvider>
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
            <div ref={containerRef}></div>
        </>
    )
}