import { ReactNode, useEffect, useState } from "react";
import Modal from "../Modal";
import { AutosaveStatusText } from "../Form/AutosaveStatusText";
import _ from "lodash";
import { useFormContext } from "react-hook-form";
import FormControl from "../Form/FormControl";
import FileInput from "../Form/FileInput";
import Link from "next/link";
import clsx from "clsx";

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
    const [taskType, setTaskType] = useState<string>('style');
    const [customModelView, setCustomModelView] = useState<'train' | 'edit' | 'default'>('default')
    const [customPrompt, setCustomPrompt] = useState<string>('a photo in the style of <1>')
    const handleNavigateCustomModelView = (e: any, view: 'train' | 'edit' | 'default') => {
        e.preventDefault();
        setCustomModelView(view)
    }

    const modelTraining = _.first(_.filter(ai_generation?.custom?.models, (m) => m.status !== "succeeded"))
    const trainingInProgress = !_.isEmpty(modelTraining)

    const trainModel = async (e: any) => {
        e.preventDefault();
        if (!zipFile) return;

        const response = await fetch("/api/train", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                instance_data: zipFile,
                task: taskType,
            }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
            console.log('err:', prediction.detail);
            return;
        }
        console.log('pred', prediction);
        let model_id = prediction.id;
        setValue('ai_generation.custom.models', {
            ...ai_generation?.custom?.models,
            [model_id]: {
                id: model_id,
                name: modelName,
                status: prediction.status
            }
        }, { shouldDirty: true })

        setCustomModelView('default')

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            if (response.status !== 200) {
                console.log('Error', prediction.detail);
                return;
            }

            console.log({ prediction })
            setValue('ai_generation.custom.models', {
                ...ai_generation?.custom?.models,
                [model_id]: {
                    id: model_id,
                    name: modelName,
                    status: prediction.status,
                    lora_url: prediction.output
                }
            }, { shouldDirty: true })
        }
    };

    const customModels = _.filter(ai_generation?.custom?.models, (m) => m.status === 'succeeded')

    useEffect(() => {
        const checkTrainingStatus = async () => {
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
            } else {
                setValue('ai_generation.custom.models', {
                    ...ai_generation?.custom?.models,
                    [modelTraining.id]: {
                        ...modelTraining,
                        status: prediction.status,
                        lora_url: prediction.output
                    }
                }, { shouldDirty: true })
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
                <FormControl label='apply graphics?'>
                    <input type="checkbox" className="toggle pro toggle-lg" {...register('pro_raw_upload')} />
                </FormControl>
                <FormControl label='disable prompt editor?' altLabel="input for users to edit image generation prompt will be hidden">
                    <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.disable_prompt_editor')} />
                </FormControl>
                {ai_generation.type != 'custom' && (
                    <FormControl label='keywords' dir='col'>
                        <h3 className="text-white/40 sm:text-xl">enter descriptive text prompts in priority order to style your content</h3>
                        <textarea
                            className='textarea pro left flex-1 w-full'
                            placeholder='xxx'
                            {...register('ai_generation.text_prompt')}
                        />
                    </FormControl>
                )}
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
                                    {!_.isEmpty(customModels) && <div className="item text-primary w-full cursor-pointer" onClick={(e) => handleNavigateCustomModelView(e, 'edit')}><div />configure current model →</div>}
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
                                <div className="list pro">
                                    <div className="item text-primary w-full cursor-pointer" onClick={(e) => handleNavigateCustomModelView(e, 'default')}>← return</div>
                                </div>
                                <FormControl label="model name">
                                    <input className="input pro" value={modelName} onChange={(e) => setModelName(e.target.value)} />
                                </FormControl>
                                <FormControl label="zip file" altLabel="upload a zip file of 20-100 training images to fine tune your model">
                                    <FileInput uploadCategory="ai" inputId='trainingPhotosInput' onInputChange={(val) => setZipFile(val)} value={zipFile} />
                                </FormControl>
                                <FormControl label="task type">
                                    <div className='flex flex-row gap-3 text-xl sm:text-4xl'>
                                        {_.map(['style', 'object'], (type, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setTaskType(type)}
                                                className={clsx('cursor-pointer transition', taskType == type ? 'text-primary' : 'text-primary/40')}>
                                                {type}
                                            </div>
                                        ))}
                                    </div>
                                </FormControl>
                                <div className="list pro">
                                    <button className="item text-primary w-full" onClick={trainModel}><span className="text-white/40">$0.49 to run</span>start training →</button>
                                </div>
                            </>
                        )}

                        {customModelView == 'edit' && (
                            <>
                                <div className="list pro">
                                    <div className="item w-full ">
                                        <button className="text-primary" onClick={(e) => handleNavigateCustomModelView(e, 'default')}>← return</button>
                                        <div className=""></div>
                                    </div>
                                </div>
                                <FormControl label='keywords' dir='col'>
                                    <h3 className="text-white/40 sm:text-xl">enter descriptive text prompts in priority order to style your content; optional due to lora influencing image generations</h3>
                                    <textarea
                                        className='textarea pro left flex-1 w-full'
                                        placeholder='xxx'
                                        {...register('ai_generation.text_prompt')}
                                    />
                                </FormControl>
                            </>
                        )}

                    </div>
                )}
            </div>
        </Modal>
    )
}