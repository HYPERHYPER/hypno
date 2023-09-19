import { ReactNode, forwardRef, useEffect } from "react";
import Modal from "../Modal";
import { AutosaveStatusText } from "../Form/AutosaveStatusText";
import DataFieldInput, { FieldSelect } from "./DataFieldInput";
import _ from "lodash";
import useArrayState from "@/hooks/useArrayState";
import { useFormContext } from "react-hook-form";
import { convertFieldArrayToObject } from "@/helpers/event";
import useDeepCompareEffect from "use-deep-compare-effect";
import FormControl from "../Form/FormControl";
import FileInput from "../Form/FileInput";
import Link from "next/link";
import clsx from "clsx";

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
                        <div
                            onClick={() => setValue('ai_generation.type', 'stable diffusion', { shouldDirty: true })}
                            className={clsx('cursor-pointer transition', ai_generation.type == 'stable diffusion' ? 'text-primary' : 'text-primary/40')}>
                            sdxl
                        </div>
                        <div
                            onClick={() => setValue('ai_generation.type', 'midjourney', { shouldDirty: true })}
                            className={clsx('cursor-pointer transition', ai_generation.type != 'stable diffusion' ? 'text-primary' : 'text-primary/40')}>
                            midjourney
                        </div>
                    </div>
                </FormControl>
                <FormControl label='keywords' dir='col'>
                    <h3 className="text-white/40 sm:text-xl">enter descriptive text prompts in priority order to style your content</h3>
                    <textarea
                        className='textarea pro left flex-1 w-full'
                        placeholder='xxx'
                        {...register('ai_generation.text_prompt')}
                    />
                </FormControl>
                {
                    ai_generation.type == 'stable diffusion' && (
                        <FormControl label='strength'>
                            <div className="flex flex-row gap-4 items-center">
                                <h3 className="text-primary text-xl sm:text-4xl">{Number(ai_generation?.image_strength)}%</h3>
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
            </div>
        </Modal>
    )
}