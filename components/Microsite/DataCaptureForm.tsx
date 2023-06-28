import { FormEventHandler, useRef } from "react";
import { CountrySelect } from "../DataCapture/CountrySelect";
import { DateInput } from "../DataCapture/DateInput";
import { replaceLinks } from "@/helpers/text";
import { useForm } from "react-hook-form";
import _ from 'lodash';
import { formatDate } from "@/helpers/date";
import axios from "axios";
import { toTextColor } from "@/helpers/color";
import useContentHeight from "@/hooks/useContentHeight";
import clsx from "clsx";
import { Balancer } from "react-wrap-balancer";

interface DataCaptureFormProps {
    title?: string;
    subtitle?: string;
    fields?: Array<{
        id: string,
        name?: string,
        required?: boolean,
        label?: string,
        type?: string;
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
}: DataCaptureFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm();
    let acceptTermsRef = useRef<HTMLInputElement>(null);
    const formData = watch();
    const contentHeight = useContentHeight({ footer: true });

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
            style={{ minHeight: contentHeight }}
            className={`min-h-[calc(100vh-85px-48px-30px-env(safe-area-inset-bottom))] overflow-auto flex items-center px-6`}>
            <div className='sm:max-w-2xl pt-9 sm:pt-[72px] pb-[72px] sm:px-10 mx-auto'>
                <div className='flex flex-col text-center'>
                    <div className='mb-4 sm:mb-8 text-lg leading-5 sm:text-3xl'>
                        <h2><Balancer>{title || 'want your photos?'}</Balancer></h2>
                        {subtitle || (!title && !subtitle) && <h2 className='text-white/50'><Balancer>{subtitle || (!title && 'add your info to continue...')}</Balancer></h2>}
                    </div>
                    <form onSubmit={handleSubmit(submitDataCapture)} className='space-y-2 flex flex-col'>
                        {fields?.map((v, i) => {
                            if (v.type == 'country') {
                                return <CountrySelect key={i} error={!_.isEmpty(errors[v.id])} placeholder={v.name} {...register(v.id, { required: v.required })} />
                            }
                            if (_.includes(v.type, 'birthday')) {
                                return <DateInput key={i} value={formData[v.id]} placeholder={_.split(v.name, '-')[0]} error={!_.isEmpty(errors[v.id])} updateValue={(value) => setValue(v.id, value)} {...register(v.id, { required: v.required, valueAsDate: true })} />
                            }
                            if (v.type == 'checkbox') {
                                return (
                                    <div key={i} className={clsx('relative flex flex-row gap-4 p-4 bg-black/10 backdrop-blur-[50px]', 'text-left justify-start items-center border-l-2 sm:border-l-4 border-white/20')}>
                                        {v.required && <div className={clsx('absolute top-1 right-2 text-2xl', errors[v.id] ? 'text-red-600' : 'text-white/30')}>*</div>}
                                        <input type="checkbox" className="checkbox" {...register(v.id, { required: v.required })} />
                                        <p className='text-xs sm:text-lg text-white/50'>
                                            <Balancer>{replaceLinks(v.label || '')}</Balancer>
                                        </p>
                                    </div>
                                )
                            }
                            return (
                                <input
                                    className={`input data-capture ${errors[v.id] && 'error text-red-600'}`}
                                    placeholder={`${v.name}${errors[v.id] ? (errors[v.id]?.type === 'pattern' ? ' is not valid' : ' is required') : ''}`}
                                    key={i}
                                    {...register(v.id, {
                                        required: v.required,
                                        ...(v.type == 'email' && { pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ }),
                                        ...(v.type == 'age' && { pattern: /^[0-9]*$/ }),
                                        ...(v.type == 'phone' && { pattern: /^[0-9]*$/ })
                                    })}
                                />
                            )
                        })}
                        {enable_legal && (
                            <div className={clsx('flex flex-row gap-4 p-4 bg-black/10 backdrop-blur-[50px]', explicit_opt_in ? 'text-left justify-start items-center border-l-2 sm:border-l-4 border-white/20' : 'items-start justify-center')}>
                                {explicit_opt_in && <input type="checkbox" className="checkbox" ref={acceptTermsRef} />}
                                <p className='text-xs sm:text-lg text-white/50'>
                                    <Balancer>{replaceLinks(terms_privacy || '')}</Balancer>
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