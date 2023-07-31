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
import { getCookie } from "cookies-next";

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

const ageValidation = (type?: string) => _.split(type, '-')[1];
const validateAge = (minAge: string, selectedDate: any) => {
    const currentDate = new Date();
    const selectedDateObj = new Date(selectedDate);
    const age = currentDate.getFullYear() - selectedDateObj.getFullYear();

    if (age < Number(minAge)) {
        return `You must be ${minAge} years or older`;
    }

    return true;
}
const formatDateForBirthdayKeys = (key: string, value: string): string | Date => {
    if (key.includes('birthday')) {
        // Format the date here
        const formattedDate = formatDate(value);
        return formattedDate;
    }

    return value;
};

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

        let formattedData: any = data;
        // Format the date for keys containing "birthday"
        Object.keys(data).forEach(key => {
            const formattedValue = formatDateForBirthdayKeys(key, data[key] as string);
            formattedData[key] = formattedValue;
        });

        metadata = {
            ...metadata,
            ...formattedData,
        }

        const token = String(getCookie('hypno_microsite'));
        const url = email_delivery ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/photos/deliver/${photoSlug}.json` : `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/photos/${photoSlug}/data_capture`;
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
                                return <DateInput key={i} value={formData[v.id]} placeholder={!_.isEmpty(errors[v.id]) ? `${_.split(v.name, '-')[0]} is required` : _.split(v.name, '-')[0]} error={!_.isEmpty(errors[v.id])} updateValue={(value) => setValue(v.id, value)} {...register(v.id, { required: v.required, valueAsDate: true, validate: ageValidation(v.type) ? (val) => validateAge(ageValidation(v.type), val) : undefined })} />
                            }
                            if (_.includes(v.type, 'checkbox')) {
                                return (
                                    <div key={i} className={clsx('relative flex flex-row gap-4 p-4 bg-black/10 backdrop-blur-[50px]', 'text-left justify-start items-center border-l-2 sm:border-l-4 border-white/20')}>
                                        {v.required && <div className={clsx('absolute top-1 right-2 text-2xl', errors[v.id] ? 'text-red-600' : 'text-white/30')}>*</div>}
                                        <input type="checkbox" className="checkbox" defaultChecked={_.includes(v.type, 'pre')} {...register(v.id, { required: v.required })} />
                                        <p className='text-xs sm:text-lg text-white/50'>
                                            <Balancer>{replaceLinks(v.label || '')}</Balancer>
                                        </p>
                                    </div>
                                )
                            }
                            return (
                                <input
                                    className={`input data-capture ${errors[v.id] && 'error text-red-600'}`}
                                    placeholder={`${v.name}${errors[v.id] ? ((errors[v.id]?.type === 'pattern' || errors[v.id]?.type === 'minLength' || errors[v.id]?.type === 'maxLength') ? ' is not valid' : ' is required') : ''}`}
                                    key={i}
                                    {...register(v.id, {
                                        required: v.required,
                                        ...(v.type == 'email' && { pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/ }),
                                        ...(v.type == 'age' && { pattern: /^[0-9]*$/ }),
                                        ...(v.type == 'phone' && { pattern: /^[0-9]*$/ }),
                                        ...(v.type == 'zip' && { pattern: /^[0-9]*$/, minLength: 5, maxLength: 5 })
                                    })}
                                />
                            )
                        })}
                        {!_.isEmpty(terms_privacy) && (
                            <div className={clsx('flex flex-row gap-4 p-4 items-start justify-center')}>
                                <p className='text-xs sm:text-lg text-white'>
                                    <Balancer>{replaceLinks(terms_privacy || '')}</Balancer>
                                </p>
                            </div>
                        )}

                        {/* {enable_legal && (
                            <div className={clsx('flex flex-row gap-4 p-4 bg-black/10 backdrop-blur-[50px]', explicit_opt_in ? 'text-left justify-start items-center border-l-2 sm:border-l-4 border-white/20' : 'items-start justify-center')}>
                                {explicit_opt_in && <input type="checkbox" className="checkbox" ref={acceptTermsRef} />}
                                <p className='text-xs sm:text-lg text-white/50'>
                                    <Balancer>{replaceLinks(terms_privacy || '')}</Balancer>
                                </p>
                            </div>
                        )} */}
                        <input className='btn btn-primary btn-gallery locked sm:block' type='submit' value='continue →' style={color ? { backgroundColor: color, borderColor: color, color: toTextColor(color) } : {}} />
                    </form>
                </div>
            </div>
        </div>
    )
}