import { ReactNode, useEffect, useState } from "react";
import Modal from "../Modal";
import { AutosaveStatusText } from "../Form/AutosaveStatusText";
import _ from "lodash";
import { useFormContext } from "react-hook-form";
import FormControl from "../Form/FormControl";
import FileInput from "../Form/FileInput";
import Link from "next/link";
import clsx from "clsx";
import axios from "axios";
import { getS3Filename } from "@/helpers/text";
import useUserStore from "@/store/userStore";

const AI_GENERATION_TYPES = ['custom', 'sdxl', 'midjourney']

const sleep = (ms: number | undefined) => new Promise((r) => setTimeout(r, ms));

export default function EffectsModal({
    children,
    status,
}: {
    children?: ReactNode,
    status: any,
}) {
    const { setValue, watch, register } = useFormContext();
    const ai_generation = watch().ai_generation;

    useEffect(() => {
        if (ai_generation.enabled && _.isNil(ai_generation.type)) {
            setValue('ai_generation.type', 'midjourney', { shouldDirty: true })
        }
    }, [ai_generation.enabled]);

    const [modelName, setModelName] = useState<string>('');
    const [zipFile, setZipFile] = useState<string>();
    const [customModelView, setCustomModelView] = useState<'train' | 'edit' | 'default'>('default')
    const handleNavigateCustomModelView = (e: any, view: 'train' | 'edit' | 'default') => {
        e.preventDefault();
        setCustomModelView(view)
    }

    const modelTraining = _.first(_.filter(ai_generation?.custom?.models, (m) => m.status !== "succeeded"))
    const trainingInProgress = !_.isEmpty(modelTraining)

    const user = useUserStore.useUser();
    const [trainingStatus, setTrainingStatus] = useState<string>();
    const [modelId, setModelId] = useState();
    const saveModelUrl = async (model_id: any, prediction: any) => {
        // Get S3 upload url
        console.log('uploading to s3');
        setTrainingStatus('saving')
        const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
        const contentType = 'application/x-tar';
        const resp = await axios.get(url, {
            params: {
                fileName: getS3Filename(user.id, 'ai', `${modelName || modelTraining.name}-trained-model`),
                contentType
            },
        });
        console.log('get s3 upload url', resp)

        const replicateModelUrl = prediction.output;
        // Fetching the tar file
        let blob;
        try {
            const fileData = await fetch(replicateModelUrl);
            blob = await fileData.blob();
            console.log('Blob created successfully');
        } catch (error) {
            console.error('Error fetching or creating blob:', error);
        }

        // Upload file to S3 upload url
        console.log('Uploading to: ', resp.data.uploadURL);
        const result = await fetch(resp.data.uploadURL, {
            method: 'PUT',
            headers: {
                'Content-Type': contentType,
            },
            body: blob,
        });

        console.log('upload to s3 results', result)

        // Check if upload was successful
        if (result.ok) {
            const s3Url = result.url.split('?')[0];
            console.log('Upload successful', s3Url);
            setValue('ai_generation.custom.models', {
                ...ai_generation?.custom?.models,
                [model_id]: {
                    ...ai_generation?.custom?.models[model_id],
                    status: prediction.status,
                    lora_url: s3Url,
                }
            }, { shouldDirty: true })
            setTrainingStatus('finished')
        } else {
            console.error('Upload failed');
            let updateModels = ai_generation?.custom?.models;
            delete updateModels[model_id]
            setValue('ai_generation.custom.models', updateModels, { shouldDirty: true })
            setTrainingStatus('failed')
        }
    }

    const trainModel = async (e: any) => {
        e.preventDefault();
        if (!zipFile) return;

        setTrainingStatus('starting')
        const response = await fetch("/api/train", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input_images: zipFile,
            }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
            console.log('err:', prediction.detail);
            setTrainingStatus('failed')
            return;
        }
        console.log('pred', prediction);
        let model_id = prediction.id;
        setModelId(modelId);
        setValue('ai_generation.custom.models', {
            ...ai_generation?.custom?.models,
            [model_id]: {
                id: model_id,
                name: modelName,
                status: prediction.status
            }
        }, { shouldDirty: true })


        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                console.log('Error', prediction.detail);
                setTrainingStatus('failed')
                return;
            }

            console.log({ prediction })
            setTrainingStatus(prediction.status)

            if (prediction.status == 'succeeded') {
                saveModelUrl(model_id, prediction);
            }
        }
    };

    const customModels = _.filter(ai_generation?.custom?.models, (m) => m.status === 'succeeded')

    useEffect(() => {
        const checkTrainingStatus = async () => {
            console.log('CHECK TRAINING STATUS')
            const response = await fetch("/api/predictions/" + modelTraining.id);
            let prediction = await response.json();
            if (response.status !== 200) {
                console.log('Error checking training status', prediction.detail);
                return;
            }

            if (prediction.status == 'failed') {
                let updateModels = ai_generation?.custom?.models;
                delete updateModels[modelTraining.id]
                setValue('ai_generation.custom.models', updateModels, { shouldDirty: true })
                return;
            }

            if (prediction.status == 'succeeded') {
                console.log('SUCCESS IN CHECK TRAINING STATUS')
                saveModelUrl(modelTraining.id, prediction);
            }
        }

        if (trainingInProgress) {
            checkTrainingStatus()
        }
    }, []);

    return (
        <Modal
            title='effects'
            id='effects-modal'
            menu={
                <>
                    <Link href='https://discord.gg/eJc8GtsPQV' className='text-primary'><h2>need help? join our discord</h2></Link>
                    {status && AutosaveStatusText(status)}
                </>
            }>
            <div className='border-t-2 border-white/20'>
                {customModelView !== 'train' &&
                    <>
                        <FormControl label='ai generator'>
                            <div className='flex flex-row gap-3 text-xl sm:text-4xl'>
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
                        <FormControl label='apply graphics'>
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('pro_raw_upload')} />
                        </FormControl>
                        <FormControl label='prompt editor' altLabel="input for users to edit image generation prompt will be hidden">
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.disable_prompt_editor')} />
                        </FormControl>
                        <FormControl label='keywords' dir='col'>
                            <h3 className="text-white/40 sm:text-xl">enter descriptive text prompts in priority order to style your content</h3>
                            <textarea
                                className='textarea pro left flex-1 w-full'
                                placeholder='xxx'
                                {...register('ai_generation.text_prompt')}
                            />
                        </FormControl>
                    </>
                }
                {
                    ai_generation.type == 'sdxl' && (
                        <FormControl label='strength'>
                            <div className="flex flex-row gap-4 items-center">
                                <h3 className="text-primary text-xl sm:text-4xl">{Number(ai_generation?.prompt_strength)}%</h3>
                                <input
                                    type="range"
                                    min={0}
                                    max="100"
                                    className="range range-primary range-lg"
                                    step="5"
                                    {...register('ai_generation.prompt_strength')}
                                />

                            </div>
                        </FormControl>
                    )}
                {ai_generation.type == 'midjourney' && (
                    <FormControl label='img prompt'>
                        <FileInput
                            inputId='ai-img'
                            onInputChange={(value: string) => setValue('ai_generation.img_prompt', [value], { shouldDirty: true })}
                            value={_.first(ai_generation.img_prompt)}
                            uploadCategory="ai"
                        />
                    </FormControl>
                )}
                {ai_generation.type == 'midjourney' && (
                    <FormControl label='parameters' dir='col'>
                        <h3 className="text-white/40 sm:text-xl"><a href='https://docs.midjourney.com/docs/parameter-list' className="text-primary mr-2 ">help</a> customize with image generation parameters</h3>
                        <textarea
                            className='textarea pro left flex-1 w-full'
                            placeholder='--param value'
                            {...register('ai_generation.midjourney_parameters')}
                        />
                    </FormControl>
                )}
                {ai_generation.type == 'custom' && (
                    <div>
                        {customModelView == 'default' && (
                            <>
                                <FormControl label='custom model'>
                                    <select
                                        value={ai_generation?.custom?.current}
                                        onChange={(e) => setValue('ai_generation.custom.current', e.target.value, { shouldDirty: true })}
                                        className="select pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl">
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
                                        <>
                                            <FormControl label="training in progress">
                                                <div className="text-white text-xl sm:text-4xl">{modelTraining.name} <span className="loading" /></div>
                                            </FormControl>
                                            {/* <FormControl>
                                                <button className="text-red-500 text-xl sm:text-4xl">cancel training</button>
                                            </FormControl> */}
                                        </>
                                        :
                                        <div className="item text-primary w-full cursor-pointer" onClick={(e) => handleNavigateCustomModelView(e, 'train')}><div />train new model →</div>
                                    }
                                </div>
                            </>
                        )}

                        {customModelView == 'train' && (
                            <>
                                <div className="list pro" style={{ borderTop: 'none' }}>
                                    {!trainingStatus ?
                                        <div className="item text-primary w-full cursor-pointer" onClick={(e) => handleNavigateCustomModelView(e, 'default')}>← return</div>
                                        :
                                        <div className="item text-white w-full">keep open while your model is training</div>
                                    }
                                </div>
                                {!trainingStatus ? (
                                    <>
                                        <FormControl label="model name">
                                            <input className="input pro" value={modelName} onChange={(e) => setModelName(e.target.value)} />
                                        </FormControl>
                                        <FormControl label="zip file" altLabel="upload a zip file of 20-100 training images to fine tune your model">
                                            <FileInput uploadCategory="ai" inputId='trainingPhotosInput' onInputChange={(val) => setZipFile(val)} value={zipFile} />
                                        </FormControl>
                                        <div className="list pro">
                                            <button className="item text-primary w-full" onClick={trainModel}><span className="text-white/40">ready?</span>start training →</button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <FormControl label="training in progress">
                                            <div className="text-white text-xl sm:text-4xl">{modelName}</div>
                                        </FormControl>
                                        <FormControl label="status">
                                            <div className="text-white text-xl sm:text-4xl flex items-center">{trainingStatus} {trainingStatus !== 'finished' && <span className="ml-2 loading" />}</div>
                                        </FormControl>
                                        {trainingStatus == 'finished' &&
                                            <div className="list pro">
                                                <div
                                                    className="item text-primary w-full cursor-pointer"
                                                    onClick={(e) => {
                                                        setValue('ai_generation.custom.current', modelId, { shouldDirty: true });
                                                        setModelName('');
                                                        setZipFile('');
                                                        setTrainingStatus(undefined);
                                                        handleNavigateCustomModelView(e, 'default');
                                                    }}>
                                                    <div />set as current model →
                                                </div>
                                            </div>
                                        }
                                    </>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Modal >
    )
}