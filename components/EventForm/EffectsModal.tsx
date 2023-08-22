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

export default function EffectsModal({
    children,
    status,
}: {
    children?: ReactNode,
    status: any,
}) {
    const { setValue, watch, register } = useFormContext();
    const ai_generation = watch().ai_generation;

    // console.log('change', ai_generation);

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
                <FormControl label='keywords' dir='col'>
                    <h3 className="text-white/40 sm:text-xl">enter descriptive text prompts in priority order to style your content</h3>
                    <textarea
                        className='textarea pro left flex-1 w-full'
                        placeholder='xxx'
                        {...register('ai_generation.text_prompt')}
                    />
                </FormControl>
                <FormControl label='strength'>
                    <div className="flex flex-row gap-4 items-center">
                        <h3 className="text-primary text-xl sm:text-4xl">{Number(ai_generation?.image_strength)}%</h3>
                        <input
                            type="range"
                            min={0}
                            max="100"
                            className="range range-primary range-lg"
                            step="5"
                            {...register('ai_generation.image_strength')}
                        />

                    </div>
                </FormControl>
                {/* <FormControl label='img prompt'>
                    <FileInput
                        inputId='ai-img'
                        onInputChange={(value: string) => setValue('ai_generation.img_prompt', value, { shouldDirty: true })}
                        value={ai_generation.img_prompt}
                        uploadCategory="user"
                    />
                </FormControl> */}
            </div>
        </Modal>
    )
}