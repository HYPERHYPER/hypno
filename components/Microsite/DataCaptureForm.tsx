import { FormEventHandler, useRef } from "react";
import { CountrySelect } from "../DataCapture/CountrySelect";
import { DateInput } from "../DataCapture/DateInput";
import { replaceLinks } from "@/helpers/text";
import { useForm } from "react-hook-form";
import _ from 'lodash';
import { formatDate } from "@/helpers/date";
import axios from "axios";
import { toTextColor } from "@/helpers/color";

interface DataCaptureFormProps {
    title?: string;
    subtitle?: string;
    fields?: Array<{
        id: string,
        name: string,
    }>
    enable_legal?: boolean;
    explicit_opt_in?: boolean;
    terms_privacy?: string;
    email_delivery?: boolean;
    asset: {
        slug: string;
        metadata: any;
    }
    color: string;
    onSuccess: () => void;
}

export default function DataCaptureForm({
    title,
    subtitle,
    fields,
    enable_legal,
    explicit_opt_in,
    terms_privacy,
    email_delivery,
    asset,
    color,
    onSuccess,
} : DataCaptureFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm();
    let acceptTermsRef = useRef<HTMLInputElement>(null);
    const formData = watch();

    const submitDataCapture = async (data: any) => {
        const userAcceptedTerms = (enable_legal && explicit_opt_in) ? acceptTermsRef?.current?.checked : true;
        if (!_.isEmpty(errors) || !userAcceptedTerms) {
            console.log("submitDataCapture errors", { errors });
            console.log("acceptTerms", acceptTermsRef?.current?.checked);
            return;
        }

        console.log("submitDataCapture", { data });

        /* Save data capture to metadata field of first photo in category */
        /* unless is just email delivery */
        const photoSlug = asset.slug;
        let metadata = asset.metadata;

        if (data.birthday) {
            data.birthday = formatDate(data.birthday);
        }
        metadata = {
            ...metadata,
            ...data,
        }

        const url = email_delivery ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/deliver/${photoSlug}.json` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/${photoSlug}.json`;
        const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
        const payload = email_delivery ? { email: data.email } : { metadata };
        let resp = await axios.put(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        });

        onSuccess();
    }

    return (
    <div
        // style={{ height: contentHeight }}
        className={`h-[calc(100vh-85px-48px-30px-env(safe-area-inset-bottom))] overflow-auto flex items-center px-6`}>
        <div className='sm:max-w-2xl py-2 sm:px-10 mx-auto'>
            <div className='flex flex-col text-center'>
                <div className='mb-4 sm:mb-8 text-lg leading-5 sm:text-3xl'>
                    <h2>{title || 'want your photos?'}</h2>
                    <h2 className='text-white/50'>{subtitle || 'add your info to continue...'}</h2>
                </div>
                <form onSubmit={handleSubmit(submitDataCapture)} className='space-y-2 flex flex-col'>
                    {fields?.map((v, i) => {
                        if (v.id == 'country') {
                            return <CountrySelect key={i} error={!_.isEmpty(errors[v.id])} placeholder={v.name} {...register(v.id, { required: true })} />
                        }
                        if (v.id == 'birthday') {
                            return <DateInput key={i} hasvalue={!_.isEmpty(formData[v.id])} placeholder={v.name} error={!_.isEmpty(errors[v.id])} {...register(v.id, { required: true, valueAsDate: true })} />
                        }
                        return (
                            <input
                                className={`input data-capture ${errors[v.id] && 'error text-red-600'}`}
                                placeholder={`${v.name}${errors[v.id] ? (errors[v.id]?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                key={i}
                                {...register(v.id, {
                                    required: true,
                                    ...(v.id == 'email' && { pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ }),
                                    ...(v.id == 'age' && { pattern: /^[0-9]*$/ })
                                })}
                            />
                        )
                    })}
                    {enable_legal && (
                        <div className='flex flex-row items-start gap-3 p-3 bg-black/10 backdrop-blur-[50px]'>
                            {explicit_opt_in && <input type="checkbox" className="checkbox checkbox-[#FFFFFF]" ref={acceptTermsRef} />}
                            <p className='text-xs sm:text-xl text-white/50'>
                                {replaceLinks(terms_privacy || '')}
                            </p>
                        </div>
                    )}
                    <input className='btn btn-primary btn-gallery locked sm:block' type='submit' value='continue →' style={color ? { backgroundColor: color, borderColor: color, color: toTextColor(color) } : {}} />
                </form>
            </div>
        </div>
    </div>
    )
}