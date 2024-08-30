import { ReactNode, useEffect, useState } from "react";
import Modal from "../../Modal";
import { AutosaveStatusText } from "../../Form/AutosaveStatusText";
import _ from "lodash";
import { useFormContext } from "react-hook-form";
import FormControl from "../../Form/FormControl";
import FileInput from "../../Form/FileInput";
import clsx from "clsx";
import useMagic from "@/hooks/useMagic";
import { DotsSpinner } from "../../Spinner";
import Star from '../../../assets/icons/star.svg';
import NewModelModal from "./NewModelModal";
import useCustomModels from "@/hooks/useCustomModels";
import Plus from 'public/pop/plus.svg';
import ExclamationFilled from 'public/pop/exclamation-filled.svg'

const AI_GENERATION_TYPES = ['custom', 'huggingface', 'midjourney']

const ImageAsset = ({ isLoading, error, src }: { isLoading: boolean, error: boolean | string, src?: string }) => {
    return (
        <div className="relative bg-black/10 backdrop-blur-[30px] h-full aspect-[9/16]">
            {(isLoading || error) && (
                <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
                    {error ?
                        <div className='text-white flex flex-col items-center text-center gap-3'>
                            <h2 className="text-3xl tracking-wider">{':('}</h2>
                            {typeof error == 'string' && <span className='text-sm text-white lowercase leading-none'>{error}</span>}
                        </div>
                        : <DotsSpinner />
                    }
                </div>
            )}

            {!_.isEmpty(src) && (
                <img src={src} className="object-cover h-full" />
            )}
        </div>
    )
}

export default function EffectsModal({
    children,
    status,
}: {
    children?: ReactNode,
    status: any,
}) {
    const { setValue, watch, register } = useFormContext();
    const ai_generation = watch().ai_generation;
    const org_id = watch().org_id;

    useEffect(() => {
        if (ai_generation.enabled && _.isNil(ai_generation.type)) {
            setValue('ai_generation.type', 'midjourney', { shouldDirty: true })
        }
    }, [ai_generation.enabled]);

    // TEST PLAYGROUND
    const testImages = ['https://images.hypno.com/8/hUk2Cjw3gkp8.jpg', 'https://images.hypno.com/8/x0qI0043gnrg.jpg', 'https://images.hypno.com/8/xmslh_Y3gkpo.jpg']
    const [imgIdx, setImgIdx] = useState<number>(0);
    const {
        images,
        isLoading,
        error,
        editTextPrompt,
        generateAiImage,
        setAsset,
        setConfig,
        resetImages,
    } = useMagic({ ...ai_generation }, { urls: { url: testImages[imgIdx] } })

    useEffect(() => {
        editTextPrompt(ai_generation.text_prompt)
    }, [ai_generation.text_prompt]);

    useEffect(() => {
        setAsset({ urls: { url: testImages[imgIdx] } })
    }, [imgIdx]);

    useEffect(() => {
        setConfig(ai_generation)
    }, [ai_generation]);

    const handleTestImageGeneration = (e: any) => {
        e.preventDefault();
        resetImages();
        generateAiImage();
    }

    const { 
        customModels: allModels,
        successfulModels: customModels,
        addModel,
        deleteModel,
 } = useCustomModels(org_id);
    const modelTraining = _.first(_.filter(allModels, (m) => m.status !== "succeeded"))
    const trainingInProgress = !_.isEmpty(modelTraining)

    const [trainingStatus, setTrainingStatus] = useState<string>();
    const loadingStates = ['pending', 'starting', 'processing', 'in-progress']

    // useEffect(() => {
    //     const checkTrainingStatus = async () => {
    //         console.log('CHECK TRAINING STATUS')
    //         const response = await fetch("/api/predictions/" + modelTraining.id);
    //         let prediction = await response.json();
    //         if (response.status !== 200) {
    //             console.log('Error checking training status', prediction.detail);
    //             return;
    //         }

    //         if (prediction.status == 'failed') {
    //             let updateModels = ai_generation?.custom?.models;
    //             delete updateModels[modelTraining.id]
    //             setValue('ai_generation.custom.models', updateModels, { shouldDirty: true })
    //             return;
    //         }

    //         if (prediction.status == 'succeeded') {
    //             console.log('SUCCESS IN CHECK TRAINING STATUS')
    //             // saveModelUrl(modelTraining.id, prediction);
    //         }
    //     }

    //     if (trainingInProgress) {
    //         checkTrainingStatus()
    //     }
    // }, []);

    return (
        <Modal
            title='effects'
            id='effects-modal'
            wide={true}
            menu={
                <>
                    {/* <Link href='https://discord.gg/eJc8GtsPQV' className='text-primary'><h2>need help? join our discord</h2></Link> */}
                    {status && AutosaveStatusText(status)}
                </>
            }
            actionBtn={{ hidden: true }}
        >
            <div className='grid grid-cols-1 xl:grid-cols-2 xl:gap-5 pb-[30px] sm:pb-0'>
                <div className='pb-7 relative flex w-full items-center justify-center'>
                    <div
                        className='absolute top-0 bottom-0 left-0 w-full'
                        style={{
                            backgroundImage: `url(${testImages[imgIdx]})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center center',
                            backgroundSize: 'cover',
                            WebkitBackgroundSize: 'cover',
                            MozBackgroundSize: 'cover',
                            OBackgroundSize: 'cover',
                            height: '100%',
                            filter: 'blur(60x)',
                            opacity: '50%',
                            transition: 'ease'
                        }}
                    />
                    <div className='absolute top-0 bottom-0 left-0 w-full backdrop-blur-[30px]' />

                    <div className='relative'>
                        <div className="h-[350px] sm:h-[420px] p-7 flex flex-row justify-center">
                            <div className="hidden sm:block">
                                <ImageAsset key='orig-img' src={testImages[imgIdx]} isLoading={false} error={false} />
                            </div>
                            <div className="relative">
                                <ImageAsset
                                    key='gen-img'
                                    src={_.first(images)?.src}
                                    isLoading={isLoading || loadingStates.includes(_.first(images)?.status || '')}
                                    error={error}
                                />
                                <div className="absolute top-2 right-2 sm:-top-5 sm:-right-5">
                                    <button className="btn btn-primary btn-square rounded-full" onClick={handleTestImageGeneration}><Star /></button>
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-row gap-3 justify-center h-[125px] w-full'>
                            {_.map(testImages, (url, i) => (
                                <div key={i} onClick={() => setImgIdx(i)} className={clsx("cursor-pointer border-2 transition", imgIdx == i ? 'border-white' : 'border-transparent')}>
                                    <img className="h-full w-auto" src={url} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='border-t-2 border-white/20 xl:-order-1'>

                    {/* ALL MODEL OPTIONS */}
                    <FormControl label='ai'>
                        <div className='flex flex-row gap-x-3 sm:text-3xl'>
                            {_.map(AI_GENERATION_TYPES, (type, i) => (
                                <div
                                    key={i}
                                    onClick={() => setValue('ai_generation.type', type, { shouldDirty: true })}
                                    className={clsx('cursor-pointer transition', ai_generation.type == type ? 'text-primary' : 'text-primary/40')}>
                                    {type}
                                </div>
                            ))}
                        </div>
                    </FormControl>
                    <FormControl label='keywords' dir='col' altLabel="enter descriptive text prompts in priority order to style your content">
                        <textarea
                            className='textarea pro left flex-1 w-full'
                            placeholder='xxx'
                            {...register('ai_generation.text_prompt')}
                        />
                    </FormControl>

                    {/* MIDJOURNEY OPTIONS */}
                    {ai_generation.type == 'midjourney' && (
                        <FormControl label='image' altLabel="upload an image prompt to style generations">
                            <FileInput
                                inputId='ai-img'
                                onInputChange={(value: string) => setValue('ai_generation.img_prompt', [value], { shouldDirty: true })}
                                value={_.first(ai_generation.img_prompt)}
                                uploadCategory="ai"
                            />
                        </FormControl>
                    )}

                    {ai_generation.type == 'midjourney' && (
                        <FormControl label='parameters' dir='col' altLabel="apply midjourney parameters across all image generations">
                            <textarea
                                rows={1}
                                className='textarea pro left flex-1 w-full'
                                placeholder='--param value'
                                {...register('ai_generation.midjourney_parameters')}
                            />
                        </FormControl>
                    )}

                    {ai_generation.type == 'midjourney' && (
                        <FormControl label='character' altLabel="adds midjourney character reference to prompt">
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.cref')} />
                        </FormControl>
                    )}

                    {ai_generation.type == 'midjourney' && (
                        <FormControl label='style' altLabel="adds midjourney style reference to prompt">
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.sref')} />
                        </FormControl>
                    )}

                    {/* CUSTOM MODEL OPTIONS */}
                    {ai_generation.type == 'custom' && (
                        <div>
                            <FormControl label='model'>
                                <select
                                    value={ai_generation?.custom?.current?.id || undefined}
                                    onChange={(e) => setValue('ai_generation.custom.current', _.find(customModels, m => m.id == e.target.value), { shouldDirty: true })}
                                    className="select pro pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent sm:text-3xl">
                                    {_.isEmpty(customModels) ?
                                        <option value={undefined}>no models trained</option>
                                        : (
                                            _.map(customModels, (model, i) => (
                                                <option value={model.id} key={i}>{model.name}</option>
                                            ))
                                        )
                                    }
                                </select>
                            </FormControl>
                            <div className="list pro">
                                {trainingInProgress ?
                                    <FormControl label="training in progress">
                                        <div className="text-white sm:text-3xl">{modelTraining.name} <span className="loading" /></div>
                                    </FormControl>
                                    :
                                    <FormControl label="new model">
                                        <Modal.Trigger id={'new-model-modal'}>
                                            <div className="sm:h-[30px] sm:w-[30px] rounded-full bg-white/20 text-black flex items-center justify-center"><Plus /></div>
                                        </Modal.Trigger>
                                    </FormControl>
                                }
                                <NewModelModal
                                    onTrainingUpdate={addModel}
                                    onTrainingFailed={deleteModel}
                                />
                            </div>
                        </div>
                    )}

                    {/* HUGGING FACE OPTIONS */}
                    {ai_generation.type == 'huggingface' && (
                        <FormControl label='model' altLabel="use existing model by pasting hugging face model name (repo/model)">
                            <input
                                className='input pro w-full'
                                placeholder='repo/model'
                                {...register('ai_generation.huggingface_model')}
                            />
                        </FormControl>
                    )}

                    {/* ALL MODEL OPTIONS */}
                    <FormControl label='graphics' altLabel="apply event graphics to ai image generations">
                        <input type="checkbox" className="toggle pro toggle-lg" {...register('pro_raw_upload')} />
                    </FormControl>
                    <FormControl label='prompt editor' altLabel="allow users to edit text prompt and regenerate in gallery">
                        <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.disable_prompt_editor')} />
                    </FormControl>

                    {ai_generation.type == 'huggingface' && (
                        <div className="alert bg-white/20 text-white py-3 mt-3 mb-3 sm:mb-0">
                            <span className="text-sm sm:text-base flex flex-row items-center gap-1"><ExclamationFilled /> this feature is experimental – use at your own risk</span>
                        </div>
                    )}
                </div>
            </div>
        </Modal >
    )
}