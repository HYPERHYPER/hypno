import { useState, useEffect, useCallback } from 'react';
import _, { debounce } from 'lodash';
import { useForm } from 'react-hook-form';
import S3Uploader from '@/components/S3Uploader';
import { ThreeDots } from 'react-loader-spinner';
import AiPlayground from '@/components/AiPlayground/AiPlayground';
import { getFilename, replaceLinks } from '@/helpers/text';
import { AxiosResponse } from 'axios';
import FormControl from '../Form/FormControl';
import Plus from 'public/pop/plus.svg'
import Modal from '../Modal';
import FileInput from '../Form/FileInput';
import useUserStore from '@/store/userStore';

interface FormData {
    event: any;
    onSubmit: ((payload: any) => Promise<AxiosResponse<any, any>>);
    view: 'default' | 'legal' | 'data';
    changeView: (view: 'default' | 'legal' | 'data') => void;
    updateStatus?: (stauts: string) => void;
    updateData?: (data: any) => void;
}

const DEFAULT_TERMS = `by tapping to get your content, you accept the <terms of use|https://hypno.com/app/terms> and <privacy policy|https://hypno.com/privacy> provided by hypno and our related partners and services.`
const FILTERS = ['raw', 'daze', 'moon', 'custom']
type AspectRatio = `${number}:${number}`;
const ASPECT_RATIOS: AspectRatio[] = ["9:16", "2:3", "3:4", "1:1", "4:3", "3:2", "16:9"];

const EventForm = (props: FormData) => {
    const { onSubmit, event, view, changeView, updateData, updateStatus } = props;
    const user = useUserStore.useUser();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitted, isValid },
        watch,
        setValue,
        reset
    } = useForm({
        defaultValues: {
            event_name: event?.name || '',
            // gallery_title: event?.metadata?.gallery_title || '',
            // gallery_subtitle: event?.metadata?.gallery_subtitle || '',
            data_capture_screen: event?.metadata?.data_capture_screen || false,
            data_capture_title: event?.metadata?.data_capture_title || '',
            data_capture_subtitle: event?.metadata?.data_capture_subtitle || '',
            fields: event?.metadata?.fields || [],
            logo: event?.metadata?.logo || '',
            background: event?.metadata?.background || '',
            color: event?.metadata?.color || '',
            terms_and_conditions: event?.terms_and_conditions || DEFAULT_TERMS,
            email_delivery: event?.metadata?.email_delivery || false,
            ai_generation: event?.metadata?.ai_generation || {},
            public_gallery: event?.metadata?.public_gallery || false,
            enable_legal: event?.metadata?.legal || false,
            enable_gallery: event?.metadata?.gallery || false,
            filter: 1,
            watermarks: {}
        }
    });

    const config = watch();
    useEffect(() => {
        if (config.email_delivery) {
            setValue('data_capture_screen', true);
            setValue('fields', ['Email'])
        }
    }, [config.email_delivery])

    const submitForm = async (data: any) => {
        updateStatus && updateStatus('saving');
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
            color: `${_.startsWith(config.color, '#') ? "" : "#"}${config.color}`,
            fields: (!_.isEmpty(data.fields) && _.first(data.fields) != '') ? _.map(_.split(data.fields, ','), (f) => f.trim()) : [],
        }

        const payload = { metadata: { ...eventMetadata }, terms_and_conditions }
        onSubmit && onSubmit(payload).then((e) => {
            console.log(e)
            updateStatus && updateStatus('success');
            reset(...data)
        }).catch((e) => {
            console.log(e)
        });
    }

    const debouncedSave = useCallback(
        debounce(() => {
            console.log("Saving");
            if (event) {
                handleSubmit(onSubmit)();
                return;
            }

            updateData && updateData(config)
        }, 1000),
        []
    );

    useEffect(() => {
        if (isDirty && isValid) {
            debouncedSave();
        }
    }, [config]);

    useEffect(() => {
        if (updateStatus) {
            if (isSubmitted) {
                updateStatus('success')
                setTimeout(() => {
                    updateStatus('ready')
                }, 3000)
            }
        }
    }, [isSubmitted]);

    return (
        <>
            <form onSubmit={handleSubmit(submitForm)} className={`grid grid-cols-1 gap-x-14 ${view == 'default' ? 'lg:grid-cols-2' : ''}`}>
                {view == 'default' && (
                    <div className='border-t-2 border-white/20'>
                        <FormControl label='title'>
                            <input
                                className='input pro'
                                {...register('event_name')} />
                        </FormControl>

                        <FormControl label='organization'>
                            {event ?
                                <div className='lowercase text-xl sm:text-4xl'>{user.organization.name}</div>
                                : (
                                    <select className='select font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl'>
                                        <option>{user.organization.name}</option>
                                    </select>
                                )}
                        </FormControl>

                        <FormControl label='capture'>
                            <div className='flex flex-row gap-3 text-xl sm:text-4xl'>
                                <div className='text-primary'>photo</div>
                                <div className="tooltip" data-tip="coming soon">
                                    <div className='text-primary/40'>video</div>
                                </div>
                                <div className="tooltip" data-tip="coming soon">
                                    <div className='text-primary/40'>burst</div>
                                </div>
                            </div>
                        </FormControl>

                        <FormControl label='filters'>
                            <Modal.Trigger id='filters-modal'>
                                <div className='flex flex-row gap-3 text-xl sm:text-4xl'>
                                    {_.map(FILTERS, (f, i) => (
                                        <span className={`transition ${config.filter == i + 1 ? 'text-primary' : 'text-primary/40'}`}>{f}</span>
                                    ))}
                                </div>
                            </Modal.Trigger>
                        </FormControl>
                        <Modal id='filters-modal' title='filters'>
                            <div className='list pro'>
                                {_.map(FILTERS, (f, i) => (
                                    <div className='item cursor-pointer' key={i} onClick={() => setValue('filter', i + 1)}>
                                        <span className={`transition ${config.filter == i + 1 ? 'text-white' : 'text-white/20'}`}>{f}</span>
                                        {config.filter == i + 1 && <div className='badge badge-primary' />}
                                    </div>
                                ))}
                            </div>
                        </Modal>

                        <FormControl label='graphics'>
                            <Modal.Trigger id='graphics-modal'>
                                <div className='text-xl sm:text-4xl text-white/20'>coming soon</div>
                            </Modal.Trigger>
                        </FormControl>
                        <Modal id='graphics-modal' title='graphics'>
                            <div className='list pro'>
                                {_.map(ASPECT_RATIOS, (ar, i) => (
                                    <div className='item' key={i}>
                                        <span className={`transition ${ar == '3:4' ? 'text-white' : 'text-white/20'}`}>{ar}</span>
                                        <FileInput
                                            orgId={user.organization.id}
                                            inputId={ar}
                                            onInputChange={(value: string) => setValue(`watermarks.${ar}`, value)}
                                            value={_.get(config.watermarks, ar)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </Modal>

                        <FormControl label='effects'>
                            <div className='text-xl sm:text-4xl text-white/20'>coming soon</div>
                        </FormControl>

                        <FormControl label='delivery'>
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('public_gallery')} />
                        </FormControl>
                    </div >
                )}

                {
                    view == 'default' && (
                        <div className='lg:border-t-2 lg:border-white/20'>
                            <FormControl label='gallery'>
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('enable_gallery')} />
                            </FormControl>

                            {/* <div className='form-control '>
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
                                </div> */}
                            <FormControl label='logo'>
                                <FileInput
                                    orgId={user.organization.id}
                                    inputId='logo'
                                    onInputChange={(value: string) => setValue('logo', value)}
                                    value={config.logo}
                                />
                            </FormControl>

                            <FormControl label='background'>
                                <FileInput
                                    orgId={user.organization.id}
                                    inputId='background'
                                    onInputChange={(value: string) => setValue('background', value)}
                                    value={config.background}
                                />
                            </FormControl>

                            <FormControl label='color'>
                                <input
                                    className='input pro'
                                    placeholder='# hex code'
                                    {...register('color')} />
                                <span className="h-10 w-10 rounded-full border-4 border-white/20" style={{ backgroundColor: `${_.startsWith(config.color, '#') ? "" : "#"}${config.color}` }}></span>
                            </FormControl>

                            <FormControl label='public'>
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('public_gallery')} />
                            </FormControl>

                            <FormControl label='data'>
                                {config.data_capture_screen && <button className="tracking-tight text-xl sm:text-4xl text-primary mr-5" onClick={() => changeView('data')}>custom</button>}
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('data_capture_screen')} />
                            </FormControl>

                            <FormControl label='legal'>
                                {config.enable_legal && <button className="tracking-tight text-xl sm:text-4xl text-primary mr-5" onClick={() => changeView('legal')}>custom</button>}
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('enable_legal')} />
                            </FormControl>


                            {/* <div className='form-control'>
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
                    </div> */}
                        </div>
                    )
                }

                {
                    view == 'data' && (
                        <div className='border-t-2 border-white/20'>
                            <FormControl label='fields' altLabel='separate multiple fields with commas'>
                                <input
                                    className='input pro flex-1'
                                    placeholder='name, email, phone'
                                    disabled={!config.data_capture_screen}
                                    {...register('fields')} />
                            </FormControl>

                            <FormControl label='headline' altLabel='this appears on your web gallery during delivery (optional)'>
                                <input
                                    className='input pro flex-1'
                                    placeholder='want your content?'
                                    disabled={!config.data_capture_screen}
                                    {...register('data_capture_title')} />
                            </FormControl>

                            <FormControl label='blurb' altLabel='this appears on your web gallery during delivery (optional)'>
                                <input
                                    className='input pro flex-1'
                                    placeholder='enter your info to continue'
                                    disabled={!config.data_capture_screen}
                                    {...register('data_capture_subtitle')} />
                            </FormControl>
                        </div>
                    )
                }

                {
                    view == 'legal' && (
                        <>
                            <div className='border-t-2 border-white/20'>
                                <FormControl label='terms/privacy' altLabel='this appears in your web gallery during delivery; format links like <link|https://domain.com>'>
                                    {/* <label className='label'>
                            <span className='label-text-alt cursor-pointer text-white/40 hover:text-white transition' onClick={() => setValue('terms_and_conditions', DEFAULT_TERMS)}>Reset</span>
                        </label> */}
                                    <textarea className='flex-1 textarea pro w-full leading-[1.1rem]' rows={5} disabled={!config.data_capture_screen} {...register('terms_and_conditions')} />
                                    {/* <label className='label'>
                            <span className='label-text text-white'>Note: to insert a link, use the pattern &#60;display text|url&#62;</span>
                            <label htmlFor='terms-preview-modal' className='label-text-alt cursor-pointer text-white/40 hover:text-white transition'>Preview</label>
                        </label> */}
                                </FormControl>
                            </div>
                            <div className=''>
                                <FormControl label='explicit opt-in' altLabel='this shows a checkbox'>
                                    <input type="checkbox" className="toggle pro toggle-lg" />
                                </FormControl>
                            </div>
                        </>
                    )
                }

                {/* <div className='flex-1 pb-5'>
                        <div className='space-y-5 w-1/2 mr-[30px]'>
                            <div className='form-control'>
                                <label className='label'>
                                    <span className='label-text text-white'>AI Remix Button</span>
                                </label>
                                <div className='flex flex-row gap-2 items-center'>
                                    <input type="checkbox" className="toggle toggle-lg" checked={config.ai_generation?.enabled} onChange={(e) => setValue('ai_generation.enabled', e.target.checked)} />
                                    <span className='text-sm text-white/40'>{!config.ai_generation?.enabled ? 'Disabled' : 'Enabled'}</span>
                                </div>
                            </div>
                            <div className="collapse collapse-arrow w-full mt-3 bg-white/10 rounded-box">
                                <input type="checkbox" />
                                <div className="collapse-title text-lg font-medium">
                                    Current Settings
                                </div>
                                <div className="collapse-content">
                                    <p>Type: {config.ai_generation?.type}</p>
                                    <p>Prompt: {config.ai_generation?.prompt}</p>
                                    <p>Image Strength: {config.ai_generation?.image_strength}</p>
                                </div>
                            </div>
                            {savedChangesStatus ? (
                                <button className='btn btn-wide'>{savedChangesStatus == 'saving' ?
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
                                <input className='btn btn-primary btn-wide' type='submit' value='SAVE' />
                            }
                        </div>


                        <div className='divider before:bg-white/[.03] after:bg-white/[.03] mr-[30px] my-[30px]' />
                        <AiPlayground gallerySlug={event?.party_slug} onSaveCurrent={(val: any) => setValue('ai_generation', { ...val, enabled: config.ai_generation.enabled })} />
                    </div> */}
            </form >

            <input type="checkbox" id="terms-preview-modal" className="modal-toggle" />
            <label htmlFor="terms-preview-modal" className="modal cursor-pointer bg-white/10 mt-0">
                <label className="modal-box relative bg-black/70 backdrop-blur-sm" htmlFor="">
                    <h3 className="text-lg font-medium">Terms and Conditions Preview</h3>
                    <p className="py-4 text-white/50">{replaceLinks(config.terms_and_conditions)}</p>
                </label>
            </label>
        </>
    );
};

export default EventForm;
