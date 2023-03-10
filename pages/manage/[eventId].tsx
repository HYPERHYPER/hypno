import axios from 'axios';
import type { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import _ from 'lodash';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import S3Uploader from '@/components/S3Uploader';
import { ThreeDots } from 'react-loader-spinner';
import nookies, { parseCookies } from 'nookies'
import AiPlayground from '@/components/AiPlayground/AiPlayground';

interface ResponseData {
    status: number;
    message: string;
    event: any;
}

const DEFAULT_TERMS = `By pressing "continue" to access and save your content, you accept the Terms of Use and Privacy Policy provided by Hypno and related partners`

const ManageEventGallery = (props: ResponseData) => {
    const { event: {
        id,
        name,
        metadata,
        terms_and_conditions,
        party_slug,
    } } = props;

    const [view, setView] = useState<'basic' | 'data' | 'ai'>('basic');
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            gallery_title: metadata.gallery_title || '',
            gallery_subtitle: metadata.gallery_subtitle || '',
            data_capture_screen: metadata.data_capture_screen || false,
            data_capture_title: metadata.data_capture_title || '',
            data_capture_subtitle: metadata.data_capture_subtitle || '',
            fields: metadata.fields || [],
            logo: metadata.logo || '',
            background: metadata.background || '',
            color: metadata.color || '',
            terms_and_conditions: terms_and_conditions || DEFAULT_TERMS,
            email_delivery: metadata.email_delivery || false,
        }
    });

    const config = watch();
    useEffect(() => {
        if (config.email_delivery) {
            setValue('data_capture_screen', true);
            setValue('fields', ['Email'])
        }
    }, [config.email_delivery])

    const [savedChangesStatus, setSavedChangesStatus] = useState<'saving' | 'completed'>()

    useEffect(() => {
        if (savedChangesStatus == 'completed') {
            setTimeout(() => {
                setSavedChangesStatus(undefined)
            }, 3000)
        }
    }, [config]);

    const submitForm = async (data: any) => {
        setSavedChangesStatus('saving');
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            return;
        }

        console.log("submitForm", { data });
        const terms_and_conditions = data.terms_and_conditions;
        delete data['terms_and_conditions']

        /* Update metadata field of event */
        let eventMetadata = props.event.metadata || {};
        eventMetadata = {
            ...props.event.metadata,
            ...data,
            fields: (!_.isEmpty(data.fields) && _.first(data.fields) != '') ? _.map(_.split(data.fields, ','), (f) => f.trim()) : [],
        }

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${id}.json`;
        const token = parseCookies().hypno_token;
        let resp = await axios.put(url, { metadata: { ...eventMetadata }, terms_and_conditions }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then((e) => {
            console.log(e)
            setSavedChangesStatus('completed')
        }).catch((e) => {
            console.log(e)
        });
    }

    return (
        <>
            <Head>
                <title>{name + ' Admin' || 'Hypno Pro Admin'}</title>
            </Head>

            <section className={`text-white bg-white/10 min-h-screen relative`}>
                <div className='sticky top-0 bg-black'>
                    <div className='mx-auto px-[30px] py-[35px] flex flex-col-reverse sm:flex-row justify-between items-start gap-3 sm:items-center'>
                        <h1 className='text-2xl'>Edit Gallery <span className='ml-1 text-gray-400'>{name}</span></h1>
                        <Image className='w-auto' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"Hypno logo"} width={100} height={100} priority />
                    </div>
                </div>

                <div className={`sm:mx-auto h-full mx-7 pb-[30px] flex flex-col sm:flex-row w-full`}>
                    <div className='mt-3 sm:mt-8 w-full sm:w-1/3 sm:p-4'>
                        <div className="tabs gap-2 font-medium bg-transparent flex flex-row sm:flex-col">
                            <a className={`tab tab-lg text-white ${view == 'basic' ? 'tab-active' : ''}`} onClick={() => setView('basic')}>Basic</a>
                            <a className={`tab tab-lg text-white ${view == 'data' ? 'tab-active' : ''}`} onClick={() => setView('data')}>Data Capture + Delivery</a>
                            <a className={`tab tab-lg text-white ${view == 'ai' ? 'tab-active' : ''}`} onClick={() => setView('ai')}>AI Playground</a>
                        </div>
                    </div>
                    { view !== 'ai' && (
                    <form onSubmit={handleSubmit(submitForm)} className='sm:mt-8 space-y-3 flex-1 flex flex-col p-4 pb-5 max-w-xs sm:max-w-lg'>
                        {view == 'basic' && (
                            <>
                                <div className='form-control '>
                                    <label className='label'>
                                        <span className='label-text text-white'>Gallery Title</span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='Share and tag all over social.'
                                        {...register('gallery_title')} />
                                </div>

                                <div className='form-control '>
                                    <label className='label'>
                                        <span className='label-text text-white'>Gallery Subtitle</span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='#hypno #pro #iphone'
                                        {...register('gallery_subtitle')} />
                                </div>

                                <div>
                                    <S3Uploader
                                        eventName={id}
                                        label={'Logo'}
                                        inputId='logo'
                                        onInputChange={(value: string) => setValue('logo', value)} 
                                        value={config.logo}
                                    />
                                </div>

                                <div>
                                    <S3Uploader
                                        eventName={id}
                                        label={'Background'}
                                        inputId='background'
                                        onInputChange={(value: string) => setValue('background', value)}
                                        value={config.background}
                                    />
                                </div>

                                <div className='form-control indicator w-full'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Button Color</span>
                                        <span className='label-text-alt'>
                                        </span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='Hex Color Code'
                                        {...register('color')} />
                                    {config.color && <span className="indicator-item indicator-middle translate-y-[40%] -translate-x-3/4 indicator-end badge" style={{ backgroundColor: config.color }}></span>}
                                </div>
                            </>
                        )}

                        {view == 'data' && (
                            <>
                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Data Capture Screen</span>
                                    </label>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <input type="checkbox" className="toggle toggle-lg" {...register('data_capture_screen')} />
                                        <span className='text-sm text-white/40'>{config.data_capture_screen ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                </div>

                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Data Capture Fields</span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='Name, Email'
                                        disabled={!config.data_capture_screen}
                                        {...register('fields')} />
                                </div>

                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Data Capture Title</span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='Want your photos?'
                                        disabled={!config.data_capture_screen}
                                        {...register('data_capture_title')} />
                                </div>

                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Data Capture Subtitle</span>
                                    </label>
                                    <input
                                        className='input'
                                        placeholder='Add your info to continue'
                                        disabled={!config.data_capture_screen}
                                        {...register('data_capture_subtitle')} />
                                </div>

                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Terms and Conditions</span>
                                        <span className='label-text-alt cursor-pointer text-white/40 hover:text-white transition' onClick={() => setValue('terms_and_conditions', DEFAULT_TERMS)}>Reset</span>
                                    </label>
                                    <textarea className='textarea w-full leading-[1.1rem]' rows={3} disabled={!config.data_capture_screen} {...register('terms_and_conditions')} />
                                </div>

                                <div className='form-control'>
                                    <label className='label'>
                                        <span className='label-text text-white'>Single Asset Email Delivery</span>
                                    </label>
                                    <div className='flex flex-row gap-2 items-center'>
                                        <input type="checkbox" className="toggle toggle-lg" {...register('email_delivery')} />
                                        <span className='text-sm text-white/40'>{config.email_delivery ? 'Enabled' : 'Disabled'}</span>
                                    </div>
                                    <label className='label'>
                                        <span className='label-text text-white'>Note: enabling email delivery will automatically enable data capture screen with email field</span>
                                    </label>
                                </div>
                            </>
                        )}
                        <div className='fixed bottom-[30px] right-1/2 translate-x-1/2'>
                            {savedChangesStatus ? (
                                <button className='btn btn-wide rounded-full shadow-lg'>{savedChangesStatus == 'saving' ?
                                    <ThreeDots
                                        height="20"
                                        width="50"
                                        radius="4"
                                        color="#FFFFFF"
                                        ariaLabel="three-dots-loading"
                                        visible={true}
                                    />
                                    :
                                    'CHANGES SAVED!'
                                }</button>
                            ) :
                                <input className='btn btn-primary btn-wide rounded-full shadow-lg' type='submit' value='SAVE' />
                            }
                        </div>
                    </form>
                    )}

                    {view == 'ai' && (
                        <div className='sm:mt-8 flex-1 p-4 pb-5'>
                            <AiPlayground gallerySlug={party_slug} />
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId, accessToken: accessTokenParam } = context.query;
    const cookieToken = nookies.get(context).hypno_token;
    let accessToken = accessTokenParam || cookieToken;
    if (!accessToken) {
        return {
            notFound: true,
        }
    }

    // Store access token in case of refresh
    if (cookieToken !== accessToken) {
        nookies.set(context, 'hypno_token', String(accessToken));
    }

    // Fetch event config
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventId}.json`;
    const token = accessToken;
    let data = {};
    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        if (res.status === 200) {
            data = await res.data;
        }
    }).catch((e) => {
        console.log(e);
    })

    if (_.isEmpty(data)) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...data,
        }
    };
};

export default ManageEventGallery;
