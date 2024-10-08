import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import _, { debounce } from 'lodash';
import GlobalLayout from '@/components/GlobalLayout';
import withAuth from '@/components/hoc/withAuth';
import { convertFieldArrayToObject, convertFieldObjectToArray, isCustomGallery } from '@/helpers/event';
import { AutosaveStatusText, SaveStatus } from '@/components/Form/AutosaveStatusText';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import FormControl from '@/components/Form/FormControl';
import FileInput from '@/components/Form/FileInput';
import clsx from 'clsx';
import { ChromePicker } from 'react-color';
import DataCaptureModal from '@/components/EventForm/DataCaptureModal';
import Modal from '@/components/Modal';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { toHexCode } from '@/helpers/color';

interface ResponseData {
    custom_frontend: any;
    custom_gallery_assigned: string;
}

const EditCustomFrontendPage = (props: ResponseData) => {
    const router = useRouter();
    const { query } = router;
    const customFrontendId = query.custom_frontend_id;

    const custom_frontend = props.custom_frontend;
    const eventId = custom_frontend.event_id;
    const custom_gallery_assigned = props.custom_gallery_assigned;

    const methods = useForm({
        defaultValues: {
            custom_frontend: !_.isEmpty(custom_gallery_assigned) ? isCustomGallery(custom_gallery_assigned) : false,
            logo_image: custom_frontend?.logo_image || '',
            home_background_image: custom_frontend?.home_background_image || '',
            primary_color: custom_frontend?.primary_color || '#00FF99',
            data_capture: custom_frontend?.data_capture || false,
            fields: custom_frontend?.fields ? convertFieldObjectToArray(custom_frontend?.fields) : [],
            data_capture_title: custom_frontend?.data_capture_title || '',
            data_capture_subtitle: custom_frontend?.data_capture_subtitle || '',
            terms_privacy: custom_frontend?.terms_privacy || '',
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitSuccessful, isValid, isSubmitting, dirtyFields, defaultValues },
        watch,
        setValue,
    } = methods;
    const config = watch();

    const [status, setStatus] = useState<SaveStatus>('ready');

    // Provided array of changed fields [{field_name: value}]
    const submitForm = async (data: any) => {
        console.log(data)
        let custom_frontend_payload = {
            logo_image: data.logo_image,
            home_background_image: data.home_background_image,
            primary_color: toHexCode(data.primary_color),
            fields: convertFieldArrayToObject(data.fields),
            data_capture: data.data_capture,
            data_capture_title: data.data_capture_title,
            data_capture_subtitle: data.data_capture_subtitle,
            enable_legal: data.enable_legal || false,
            explicit_opt_in: data.explicit_opt_in || false,
            terms_privacy: data.terms_privacy
        };

        let event_payload = {
            event: {
                custom_gallery_assigned: data.custom_frontend ? "1" : "0"
            }
        }

        const customFrontendUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/custom_frontends/${customFrontendId}`;
        const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}`;
        const token = String(query.token);
        await Promise.all([
            axios.put(customFrontendUrl, custom_frontend_payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            }),
            axios.put(eventUrl, event_payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            })
        ]).then((res) => {
            console.log(res);
        }).catch((e) => {
            console.log(e);
        });
    }

    const debouncedSave = useCallback(
        debounce(() => {
            if (custom_frontend) {
                handleSubmit(submitForm)();
                return;
            }
        }, 1000),
        []
    );

    useDeepCompareEffect(() => {
        if (isDirty) {
            setStatus('saving');
            debouncedSave();
        }
    }, [config, isDirty]);

    useEffect(() => {
        if (isSubmitting) setStatus('saving')
        if (isSubmitSuccessful) {
            setStatus('success')
            setTimeout(() => {
                setStatus('ready')
            }, 3000)

        }
    }, [isSubmitSuccessful, isSubmitting]);


    return (
        <>
            <Head>
                <title>{'edit branded gallery'} | hypno™</title>
            </Head>

            <GlobalLayout paymentPlansModal={false}>
                <GlobalLayout.Header
                    title={'edit branded gallery'}
                >
                    {AutosaveStatusText(status)}
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(submitForm)} className={`grid grid-cols-1 gap-x-14}`}>

                            <div className='lg:border-t-2 lg:border-white/20'>
                                <FormControl label='branded gallery'>
                                    <input 
                                        type="checkbox" 
                                        className="toggle pro toggle-lg" 
                                        {...register('custom_frontend')}
                                    />
                                </FormControl>


                                <FormControl label='logo' nested={true} disabled={!config.custom_frontend}>
                                    <FileInput
                                        inputId='logo'
                                        onInputChange={(value: string) => setValue('logo_image', value, { shouldDirty: true })}
                                        value={config.logo_image}
                                        disabled={!config.custom_frontend}
                                        uploadCategory='logo'
                                    />
                                </FormControl>

                                <FormControl label='background' nested={true} disabled={!config.custom_frontend}>
                                    <FileInput
                                        inputId='background'
                                        onInputChange={(value: string) => setValue('home_background_image', value, { shouldDirty: true })}
                                        value={config.home_background_image}
                                        disabled={!config.custom_frontend}
                                        uploadCategory='background'
                                    />
                                </FormControl>

                                <FormControl label='color' nested={true} disabled={!config.custom_frontend}>
                                    <input
                                        className='input pro disabled:text-white/20 transition-colors'
                                        placeholder='# hex code'
                                        disabled={!config.custom_frontend}
                                        {...register('primary_color')} />
                                    <div className="dropdown dropdown-top dropdown-end">
                                        <label
                                            className='w-full'
                                            tabIndex={0}>
                                            <span className={clsx("inline-flex h-10 w-10 rounded-full border-4 border-white/20 cursor-pointer")} style={{ backgroundColor: `${_.startsWith(config.primary_color, '#') ? "" : "#"}${config.primary_color}` }} />
                                        </label>
                                        <div
                                            tabIndex={0}
                                            className='dropdown-content shadow mb-2 p-2 rounded-full'>
                                            <ChromePicker color={config.primary_color || '#000000'} onChange={(color: any, e: any) => { e.preventDefault(); setValue('primary_color', color.hex, { shouldDirty: true }) }} disableAlpha={true} />
                                        </div>
                                    </div>
                                </FormControl>

                                <FormControl label='data/legal' nested={true} disabled={!config.custom_frontend}>
                                    {config.data_capture && config.custom_frontend && <Modal.Trigger id='data-modal'><div className="tracking-tight sm:text-3xl text-primary mr-5">custom</div></Modal.Trigger>}
                                    <input type="checkbox" className="toggle pro toggle-lg" disabled={!config.custom_frontend} {...register('data_capture')} />
                                </FormControl>

                            </div>


                            <DataCaptureModal status={status}>
                                <FormControl label='headline'>
                                    <input
                                        className='input pro flex-1 w-full'
                                        placeholder='want your content?'
                                        disabled={!config.data_capture}
                                        {...register('data_capture_title')} />
                                </FormControl>

                                <FormControl label='blurb'>
                                    <input
                                        className='input pro flex-1 w-full'
                                        placeholder='enter your info to continue'
                                        disabled={!config.data_capture}
                                        {...register('data_capture_subtitle')} />
                                </FormControl>

                            </DataCaptureModal>
                        </form >
                    </FormProvider>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { custom_frontend_id, token: adminToken } = context.query;
    if (!adminToken || !custom_frontend_id) {
        return {
            notFound: true,
        }
    }

    // Store access token in case of refresh
    // if (cookieToken !== accessToken) {
    //     nookies.set(context, 'hypno_token', String(accessToken));
    // }

    // Fetch custom frontend config
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/custom_frontends/${String(custom_frontend_id)}`;
    const token = adminToken;
    let data: any = {};
    let custom_gallery_assigned = '0';
    if (token && custom_frontend_id) {
        await axios.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then(async (res) => {
            if (res.status === 200) {
                data = await res.data;
                const eventId = data.custom_frontend?.event_id;
                const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
                await axios.get(eventUrl, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }).then(async (res) => {
                    if (res.status === 200) {
                        let eventData = await res.data;
                        custom_gallery_assigned = eventData.event.custom_gallery_assigned;
                    }
                }).catch((e) => {
                    console.log(e);
                })
            }
        }).catch((e) => {
            console.log(e);
        })
    }

    if ((_.isEmpty(data)) && token && custom_frontend_id) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...data,
            custom_gallery_assigned,
        }
    };
};

export default withAuth(EditCustomFrontendPage, 'admin');

