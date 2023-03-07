import useSWRInfinite from 'swr/infinite';
import _ from 'lodash';
import { axiosGetWithToken, fetchWithToken } from '@/lib/fetchWithToken';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '../Spinner';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import useSWR from 'swr';
import { useState } from 'react';
import Image from 'next/image';
import { useStableDiffusion } from '@/hooks/useStableDiffusion';

interface AiPlaygroundProps {
    gallerySlug: string;
}

type ImageData = {
    id: number;
    event_id: number;
    event_name: string;
    slug: string;
    media_slug: string;
    state: string;
    url: string;
    jpeg_url: string;
    jpeg_thumb_url: string;
    jpeg_3000_thumb_url: string;
    posterframe: string;
    ipad_id: number;
    uploaded: string;
    updated_at: string;
    moderated: boolean;
    captured_at: string;
    format_generation: string; //(actually a number in quotes)
    grizzly_url: string;
    download_url: string;
    hi_res_url: string; //not in use
    raw_asset_url: string;
    raw_asset_mp4_url: string; // not in use
    metadata: Object; // need to type?
    export: boolean;
    export_settings: Object; //need to type
};

export default function AiPlayground(props: AiPlaygroundProps) {
    const photoUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${props.gallerySlug}/photos.json`;
    const { data : initialData, error : initialError } = useSWR([photoUrl, process.env.NEXT_PUBLIC_AUTH_TOKEN],
        ([url, token]) => axiosGetWithToken(url, token))
    let photos: ImageData[] = initialData?.photos || [];

    // TODO: Infinite scroll on gallery
    // const getKey = (pageIndex: number, previousPageData: any) => {
    //     if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
    //     let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${props.gallerySlug}/photos.json`
    //     if (pageIndex === 0) return [url, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    //     const lastItemIdx = _.get(_.last(previousPageData?.photos), 'id');
    //     return [`${url}?key_id=${lastItemIdx}`, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    // }

    // const { data, size, setSize, error, isLoading } = useSWRInfinite(getKey,
    //     ([url, token]) => fetchWithToken(url, token), {
    //     fallbackData: initialData,
    // });

    // const paginatedPhotos = _.map(data, (v) => v.photos).flat();
    // const hasReachedEnd = data && data[data.length - 1]?.length < data[0]?.returned;
    // const loadingMore = data && typeof data[size - 1] == 'undefined'

    const [diffusionType, setDiffusionType] = useState<'img2img' | 'text-inpainting' | string>('img2img');
    const [previewImageUrl, setPreviewImageUrl] = useState<string>();

    // Stable Diffusion parameters
    const [prompt, setPrompt] = useState<string>('');
    const [imageStrength, setImageStrength] = useState<number>(50); // [0-100] -> [0-1]
    const [seed, setSeed] = useState<number | false>();

    // Text inpainting parameters
    const [objectToReplace, setObjectToReplace] = useState<string>('');
    const [replaceWith, setReplaceWith] = useState<string>('');

    const { output, generateImgToImg, generateTextInpainting, isLoading: isLoadingGeneration } = useStableDiffusion();
    const handleGenerate = async () => {
        const buffer = await fetch(`/api/file?url=${previewImageUrl}`)
            .then((res) => res.json())
            .then((data) => {
                console.log('imgdata', data)
                return data.data
            })

        switch (diffusionType) {
            case 'img2img': {
                generateImgToImg({ imageBuffer: buffer, prompt, seed: seed || undefined, imageStrength: imageStrength / 100 });
                return;
            }
            case 'text-inpainting': {
                generateTextInpainting({ imageBuffer: buffer, objectToReplace, replaceWith })
                return;
            }
        }
    }

    return (
        <div className='flex flex-col sm:flex-row w-full gap-8 max-w pr-[30px]'>
            <div className='w-1/2 space-y-6'>
                <div className='w-full block mx-auto h-[30vh] overflow-auto bg-white/10 rounded-box p-4'>
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 1000: 2, 1600: 3 }}>
                        <Masonry gutter='10px'>
                            {photos.map((p) => (
                                <div
                                    key={p.id}
                                    className='hover:cursor-pointer block relative bg-white/10 backdrop-blur-[50px] w-full h-auto aspect-square mx-auto overflow-hidden'
                                    onClick={() => setPreviewImageUrl(p.url)}
                                >
                                    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10'>
                                        <Spinner />
                                    </div>
                                    <img src={p.jpeg_url} className='w-full h-full object-cover hover:scale-105 transition' />
                                    {/* <AutosizeImage
                                        src={p.jpeg_url}
                                        alt={p.event_name + p.id}
                                        height={200}
                                    /> */}
                                </div>
                            ))}
                        </Masonry>
                    </ResponsiveMasonry>
                </div>
                <div className='flex-1 space-y-6'>
                    <select className='select w-full' onChange={(e) => setDiffusionType(e.target.value)} value={diffusionType}>
                        <option value='img2img'>Stable Diffusion</option>
                        <option value='text-inpainting'>Text-based Inpainting</option>
                    </select>
                    <div className='flex flex-row gap-8'>
                        <div>
                            <div className='bg-black w-[200px] h-[200px] relative'>
                                {/* <span className='place-content-center w-full h-full'>Select an image from the gallery to preview</span> */}
                                {previewImageUrl && <Image fill className='object-contain' src={previewImageUrl} alt={previewImageUrl} />}
                            </div>
                        </div>

                        <div className='flex-1 space-y-3'>
                            {diffusionType === 'img2img' && (
                                <>
                                    <div className='form-control'>
                                        <label className='label'>
                                            <span className='label-text text-white'>Prompt</span>
                                            {/* <span className='label-text-alt cursor-pointer text-white/40 hover:text-white transition' onClick={() => setValue('terms_and_conditions', DEFAULT_TERMS)}>Reset</span> */}
                                        </label>
                                        <textarea className='textarea w-full leading-[1.1rem]' rows={3} onChange={(e) => { e.preventDefault(); setPrompt(e.target.value) }} />
                                    </div>

                                    <div className='form-control'>
                                        <label className='label'>
                                            <span className='label-text text-white'>Image Strength</span>
                                        </label>
                                        <div className='flex flex-row items-center gap-4'>
                                            <input type="range" min="0" max="100" value={imageStrength} className="range range-primary range-sm bg-white/10 w-1/2" onChange={(e) => setImageStrength(Number(e.target.value))} />
                                            <span className='font-medium'>{imageStrength / 100}</span>
                                        </div>
                                    </div>

                                    <div className='form-control'>
                                        <label className='label'>
                                            <span className='label-text text-white'>Seed</span>
                                        </label>
                                        <div className='flex flex-row gap-2 items-center'>
                                            <input type="checkbox" className="toggle toggle-lg" checked={Boolean(seed)} onChange={() => setSeed(seed ? false : 1234)} />
                                            {!seed ? <span className='text-sm text-white/40'>Random seed</span> :
                                                <input className='input input-sm' value={seed} onChange={(e) => setSeed(Number(e.target.value))} />
                                            }
                                        </div>
                                        <label className='label'>
                                            <span className='label-text text-white/10'>Note: Setting seed will let you iterate prompt on same image</span>
                                        </label>
                                    </div>
                                </>
                            )}

                            {diffusionType === 'text-inpainting' && (
                                <>
                                    <div className='form-control'>
                                        <label className='label'>
                                            <span className='label-text text-white'>What do you want to replace?</span>
                                        </label>
                                        <input className='input w-full leading-[1.1rem]' onChange={(e) => { e.preventDefault(); setObjectToReplace(e.target.value) }} />
                                    </div>

                                    <div className='form-control'>
                                        <label className='label'>
                                            <span className='label-text text-white'>What do you want as a replacement?</span>
                                        </label>
                                        <input className='input w-full leading-[1.1rem]' onChange={(e) => { e.preventDefault(); setReplaceWith(e.target.value) }} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <button className='btn btn-primary mt-8 btn-block' onClick={handleGenerate}>GENERATE</button>

                </div>
            </div>

            <div className='flex-1 max-w-[512px]'>
                <h2 className='text-xl text-white/20 mb-3'>Generated Output</h2>
                <div className='bg-black w-full aspect-square relative overflow-hidden'>
                    {output && <img src={output} className={`w-full h-full top-0 left-0 transition ${isLoadingGeneration ? 'blur-sm' : ''}`} />}
                    {isLoadingGeneration && <span className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'><Spinner /></span>}
                </div>
            </div>
        </div>
    )
}

