import { useState, useEffect } from 'react';
import _ from 'lodash';
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
}

const DEFAULT_TERMS = `by tapping to get your content, you accept the <terms of use|https://hypno.com/app/terms> and <privacy policy|https://hypno.com/privacy> provided by hypno and our related partners and services.`
const FILTERS = ['raw', 'daze', 'moon', 'custom']

const EventForm = (props: FormData) => {
    const { onSubmit, event, view, changeView } = props;
    const user = useUserStore.useUser();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm({
        defaultValues: {
            event_name: event?.name || '',
            gallery_title: event?.metadata?.gallery_title || '',
            gallery_subtitle: event?.metadata?.gallery_subtitle || '',
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
            color: `${_.startsWith(config.color, '#') ? "" : "#"}${config.color}`,
            fields: (!_.isEmpty(data.fields) && _.first(data.fields) != '') ? _.map(_.split(data.fields, ','), (f) => f.trim()) : [],
        }

        const payload = { metadata: { ...eventMetadata }, terms_and_conditions }
        onSubmit && onSubmit(payload).then((e) => {
            console.log(e)
            setSavedChangesStatus('completed')
        }).catch((e) => {
            console.log(e)
        });
    }

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
                            <select className='select font-normal lowercase bg-transparent active:bg-transparent text-4xl'>
                                <option>{user.organization.name}</option>
                            </select>
                        </FormControl>

                        <FormControl label='capture'>
                            <div className='flex flex-row gap-3 text-4xl'>
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
                                <div className='flex flex-row gap-3 text-4xl'>
                                    {_.map(FILTERS, (f, i) => (
                                        <span className={`transition ${f == 'raw' ? 'text-primary' : 'text-primary/40'}`}>{f}</span>
                                    ))}
                                </div>
                            </Modal.Trigger>
                        </FormControl>
                        <Modal id='filters-modal' title='filters'>
                            <div className='list pro'>
                                {_.map(FILTERS, (f, i) => (
                                    <div className='item' key={i}>
                                        <span className={`transition ${f == 'raw' ? 'text-white' : 'text-white/20'}`}>{f}</span>
                                        {f == 'raw' && <div className='badge badge-primary' />}
                                    </div>
                                ))}
                            </div>
                        </Modal>

                        <FormControl label='graphics'>
                            <div className='text-4xl text-white/20'>coming soon</div>
                        </FormControl>

                        <FormControl label='effects'>
                            <div className='text-4xl text-white/20'>coming soon</div>
                        </FormControl>

                        <FormControl label='delivery'>
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('public_gallery')} />
                        </FormControl>
                    </div>
                )}

                {view == 'default' && (
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
                            <div className='flex gap-3'>
                                <span className='text-4xl text-primary truncate'>{getFilename(config.logo)}</span>
                                <label htmlFor='logo-modal' className="cursor-pointer h-10 w-10 rounded-full bg-white/20 text-black flex items-center justify-center"><Plus /></label>
                            </div>
                        </FormControl>
                        <Modal id='logo-modal' title='logo'>
                            <div className='list pro'>
                                <FormControl label='url'>
                                    <FileInput
                                        orgId={user.organization.id}
                                        inputId='logo'
                                        onInputChange={(value: string) => setValue('logo', value)}
                                        value={config.logo}
                                    />
                                </FormControl>
                            </div>
                        </Modal>

                        <FormControl label='background'>
                            <div className='flex gap-3'>
                                <span className='text-4xl text-primary truncate'>{getFilename(config.background)}</span>
                                <label htmlFor='background-modal' className="cursor-pointer h-10 w-10 rounded-full bg-white/20 text-black flex items-center justify-center"><Plus /></label>
                            </div>
                        </FormControl>
                        <Modal id='background-modal' title='background'>
                            <FileInput
                                orgId={user.organization.id}
                                inputId='background'
                                onInputChange={(value: string) => setValue('background', value)}
                                value={config.background}
                            />
                        </Modal>

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
                            {config.data_capture_screen && <button className="tracking-tight text-4xl text-primary mr-5" onClick={() => changeView('data')}>custom</button>}
                            <input type="checkbox" className="toggle pro toggle-lg" {...register('data_capture_screen')} />
                        </FormControl>

                        <FormControl label='legal'>
                            {config.enable_legal && <button className="tracking-tight text-4xl text-primary mr-5" onClick={() => changeView('legal')}>custom</button>}
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
                )}

                {view == 'data' && (
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
                )}

                {view == 'legal' && (
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
            </form>

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
