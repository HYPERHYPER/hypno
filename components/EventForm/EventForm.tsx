import { useEffect, useCallback, useState } from 'react';
import _, { debounce } from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import AiPlayground from '@/components/AiPlayground/AiPlayground';
import { replaceLinks } from '@/helpers/text';
import { AxiosResponse } from 'axios';
import FormControl from '../Form/FormControl';
import Modal from '../Modal';
import FileInput from '../Form/FileInput';
import useUserStore from '@/store/userStore';
import { toHexCode } from '@/helpers/color';
import useDeepCompareEffect from "use-deep-compare-effect";
import clsx from 'clsx';
import { blendModes, convertFieldArrayToObject, convertFieldObjectToArray, isCustomGallery } from '@/helpers/event';
import { ChromePicker } from 'react-color';
import { AutosaveStatusText, SaveStatus } from '../Form/AutosaveStatusText';
import useFilters from '@/hooks/useFilters';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from '../Spinner';
import DataCaptureModal from './DataCaptureModal';
import EffectsModal from './EffectsModal';
import useOrgAccessStore from '@/store/orgAccessStore';

interface FormData {
    event?: any;
    onSubmit?: ((payload: any) => Promise<AxiosResponse<any, any>> | Promise<AxiosResponse<any, any>[]>);
    view: 'default' | 'legal' | 'data';
    changeView: (view: 'default' | 'legal' | 'data') => void;
    updateStatus?: (stauts: SaveStatus) => void;
    updateData?: (data: any) => void;
    status?: SaveStatus;
}

const DEFAULT_TERMS = `by tapping to get your content, you accept the <terms of use|https://hypno.com/app/terms> and <privacy policy|https://hypno.com/privacy> provided by hypno and our related partners and services.`
const FILTERS = [{ name: 'raw', id: 59 }, { name: 'daze', id: 60 }, { name: 'nite', id: 61 }]
type AspectRatio = `${number}:${number}`;
const ASPECT_RATIOS: AspectRatio[] = ["9:16", "2:3", "3:4", "1:1", "4:3", "3:2", "16:9"];
const AspectRatioWatermark = (ar: string): ('watermarks.9:16' | 'watermarks.2:3' | 'watermarks.3:4' | 'watermarks.1:1' | 'watermarks.4:3' | 'watermarks.3:2' | 'watermarks.16:9') => {
    return Object(`watermarks.${ar}`);
}

const isShowingQrCode = (event_ipad_screens: any) => _.size(event_ipad_screens) === 3;
const getFilter = (event_filter_watermarks: any) => Object(_.first(event_filter_watermarks))?.filter?.id;

const getWatermarkFromArray = (event_filter_watermarks: any, ar: string) => {
    return _.find(event_filter_watermarks, (wm) => wm.name == ar)?.watermark;
}

const checkWatermarkChange = (prevWatermarks: any, currentWatermarks: any) => {
    for (const key in currentWatermarks) {
        if (currentWatermarks[key] !== prevWatermarks[key]) {
            return true;
        }
    }
    return false;
}

const toExpectedValue = (key: string, value: any) => {
    switch (key) {
        case 'primary_color': return toHexCode(value);
        case 'fields': return convertFieldArrayToObject(value);
        case 'qr_delivery': return value ? 'qr_gallery' : 'qr';
        case 'custom_gallery_assigned': return value ? '1' : '0';
        default: return value;
    }
}

const getChangedFields = (prevValues: any, currentValues: any) => {
    let fieldsArr: any[] = [];
    _.forEach(Object.keys(currentValues), (key) => {
        if (key !== 'watermarks') {
            if (!_.isEqual(currentValues[key], prevValues[key])) {
                fieldsArr.push({ [key]: toExpectedValue(key, currentValues[key]) });
            }
        }
    })
    return fieldsArr;
}

const getWatermarkIdByName = (watermarksArr: any, name: string) => {
    const watermark = _.find(watermarksArr, { name })?.watermark;
    return watermark ? watermark.id : null;
};

const isPrivate = (is_private: number) => {
    return is_private == 2;
}

const EventForm = (props: FormData) => {
    const { onSubmit, event, view, changeView, updateData, updateStatus, status } = props;
    const user = useUserStore.useUser();

    const methods = useForm({
        defaultValues: {
            name: event?.name || '',
            org_id: event?.client_id || user?.organization.id,
            // gallery_title: event?.metadata?.gallery_title || '',
            // gallery_subtitle: event?.metadata?.gallery_subtitle || '',
            filter: getFilter(event?.event_filter_watermarks) || 59, // raw == 59
            watermarks: {
                '9:16': getWatermarkFromArray(event?.event_filter_watermarks, '9:16')?.url || "",
                '2:3': getWatermarkFromArray(event?.event_filter_watermarks, '2:3')?.url || "",
                '3:4': getWatermarkFromArray(event?.event_filter_watermarks, '3:4')?.url || "",
                '1:1': getWatermarkFromArray(event?.event_filter_watermarks, '1:1')?.url || "",
                '4:3': getWatermarkFromArray(event?.event_filter_watermarks, '4:3')?.url || "",
                '3:2': getWatermarkFromArray(event?.event_filter_watermarks, '3:2')?.url || "",
                '16:9': getWatermarkFromArray(event?.event_filter_watermarks, '16:9')?.url || "",
            },
            blendmode: event?.metadata?.blendmode || 'kCGBlendModeNormal',
            qr_delivery: event ? (isShowingQrCode(event.event_ipad_screens)) : true,
            custom_gallery_assigned: event ? isCustomGallery(event.custom_gallery_assigned) : false,
            logo_image: event?.custom_frontend?.logo_image || '',
            home_background_image: event?.custom_frontend?.home_background_image || '',
            primary_color: event?.custom_frontend?.primary_color || '#00FF99',
            is_private: event ? isPrivate(event.is_private) : false,
            data_capture: event?.custom_frontend?.data_capture || false,
            fields: event?.custom_frontend?.fields ? convertFieldObjectToArray(event?.custom_frontend?.fields) : [],
            data_capture_title: event?.custom_frontend?.data_capture_title || '',
            data_capture_subtitle: event?.custom_frontend?.data_capture_subtitle || '',
            enable_legal: event?.custom_frontend?.enable_legal || false,
            terms_privacy: event?.custom_frontend?.terms_privacy || '',
            explicit_opt_in: event?.custom_frontend?.explicit_opt_in || false,
            enable_magic_button: event?.metadata?.magic_button || false,
            magic_button_text: event?.metadata?.magic_button?.text || '',
            magic_button_url: event?.metadata?.magic_button?.url || '',
            // email_delivery: event?.metadata?.email_delivery || false,
            ai_generation: event?.metadata?.ai_generation || {},
            pro_raw_upload: event?.metadata?.pro_raw_upload || false,
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isSubmitSuccessful, isValid, isSubmitting, dirtyFields, defaultValues },
        watch,
        setValue,
        reset
    } = methods;
    const config = watch();
    const watchedWatermarks = watch('watermarks');

    const { filters, loadMore: loadMoreFilters, meta: filterMeta } = useFilters(20);

    // TODO: hiding email delivery for now
    // useEffect(() => {
    //     if (config.email_delivery) {
    //         setValue('data_capture', true);
    //         setValue('fields', ['Email'])
    //     }
    // }, [config.email_delivery])
    const submitForm = (data: any) => {
        if (!_.isEmpty(errors)) {
            console.log("submitForm errors", { errors });
            return;
        }

        console.log("submitForm", { data });
        let dirtyFields = getChangedFields(defaultValues, data) || [];
        const dirtyWatermarks = getChangedFields(defaultValues?.watermarks, data.watermarks)
        if (!_.isEmpty(dirtyWatermarks)) {
            _.forEach(dirtyWatermarks, (wm) => {
                for (const key in wm) {
                    const watermark_id = getWatermarkIdByName(event?.event_filter_watermarks, key)
                    dirtyFields.push({ 'watermark': { url: wm[key], id: watermark_id } });
                }
            });
        }

        onSubmit && onSubmit(dirtyFields).then((res) => {
            console.log('res', res)
            updateStatus && updateStatus('success');
            reset({ ...data })
        }).catch((e) => {
            console.log('error', e)
            updateStatus && updateStatus('error');
        });
    }

    const debouncedSave = useCallback(
        debounce(() => {
            if (event && onSubmit) {
                handleSubmit(submitForm)();
                return;
            }
        }, 3000),
        []
    );

    useDeepCompareEffect(() => {
        if (isDirty || checkWatermarkChange(defaultValues?.watermarks, watchedWatermarks)) {
            updateStatus && updateStatus('saving');
            debouncedSave();
        }
    }, [config, isDirty]);

    useEffect(() => {
        if (isDirty && updateData) {
            // Updates data for new event form
            updateData(config);
            reset(config);
        }
    }, [isDirty]);

    useEffect(() => {
        if (updateStatus) {
            if (isSubmitting) updateStatus('saving')
            if (isSubmitSuccessful) {
                updateStatus('success')
                setTimeout(() => {
                    updateStatus('ready')
                }, 3000)
            }
        }
    }, [isSubmitSuccessful, isSubmitting]);

    const organizations = useOrgAccessStore.useOrganizations();
    const getOrganizations = useOrgAccessStore.useGetOrganizations();
    const isLoadingOrgs = useOrgAccessStore.useIsLoading();
    useEffect(() => {
        getOrganizations();
    }, []);

    const [featureAccess, setFeatureAccess] = useState<any>(null);
    // useEffect to update featureAccess whenever config.org_id changes
    useEffect(() => {
        // Find the organization with the matching id
        const org = _.find(organizations, (org) => org.id == config.org_id);
        // Update featureAccess based on the found organization
        if (org) {
            setFeatureAccess(org.metadata.hypno_pro);
        } else {
            // If no matching organization is found, set featureAccess to a default value
            setFeatureAccess(null);
        }
        // The dependency array ensures this effect runs whenever config.org_id changes
    }, [config.org_id, organizations]);

    return (
        <>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(submitForm)} className={`grid grid-cols-1 gap-x-14 ${view == 'default' ? 'lg:grid-cols-2' : ''}`}>
                    {view == 'default' && (
                        <div className='border-t-2 border-white/20'>
                            <FormControl label='title*'>
                                <input
                                    className='input pro flex-1'
                                    {...register('name')} />
                            </FormControl>

                            <FormControl label='organization'>
                                {event ?
                                    <div className='lowercase text-xl sm:text-4xl'>{isLoadingOrgs ?  <span className='loading loading-spinner loading-sm sm:loading-md' /> : _.find(organizations, (o) => o.id == config.org_id)?.name}</div>
                                    : (
                                        isLoadingOrgs ?
                                            <span className='loading loading-spinner loading-sm sm:loading-md' />
                                            :
                                            <select onChange={(e) => setValue('org_id', e.target.value)} value={config.org_id} className='select pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl'>
                                                {_.map(organizations, ((o) => <option key={o.id} value={o.id}>{o.name}</option>))}
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
                                            <span key={i} className={`transition ${config.filter == f.id ? 'text-primary' : 'text-primary/40'}`}>{f.name}</span>
                                        ))}
                                        {!_.find(FILTERS, (f) => f.id == config.filter) && <span key={config.filter} className={'text-primary'}>{_.find(filters, (f) => f.id == config.filter)?.name || ''}</span>}
                                    </div>
                                </Modal.Trigger>
                            </FormControl>
                            <Modal id='filters-modal' title='filters' menu={status && AutosaveStatusText(status)}>
                                <InfiniteScroll next={loadMoreFilters} dataLength={filters.length} loader={<div className='w-full flex justify-center my-6'><Spinner /></div>} hasMore={filterMeta ? filterMeta?.total_count > filters.length : true}>
                                    <div className='list pro'>
                                        {/* TODO: CUSTOM FILTERS */}
                                        {/* <div className='item cursor-pointer' key={'custom-filter'} onClick={() => setValue('filter', 'custom', { shouldDirty: true })}>
                                        <span className={`transition ${config.filter == 'custom' ? 'text-white' : 'text-white/20'}`}>custom</span>
                                        <FileInput
                                            inputId='custom-filter'
                                            onInputChange={() => null}
                                            value=''
                                            uploadCategory='filter'
                                            validateAspectRatio='1:1'
                                        />
                                        {(f != 'custom' && config.filter == i + 1) && <div className='badge badge-primary' />}
                                    </div> */}
                                        {_.map(filters, (f, i) => (
                                            <div className='item cursor-pointer' key={i} onClick={() => setValue('filter', f.id, { shouldDirty: true })}>
                                                <span className={`transition ${config.filter == f.id ? 'text-white' : 'text-white/20'}`}>{f.name}</span>
                                                {(config.filter == f.id) && <div className='badge badge-primary' />}
                                            </div>
                                        ))}

                                    </div>
                                </InfiniteScroll>
                            </Modal>

                            <FormControl label='graphics' featureGated={featureAccess?.graphics ? undefined : 'creator'}>
                                <Modal.Trigger id='graphics-modal'>
                                    {_.every(config.watermarks, (value) => value === "") ?
                                        <div className='text-xl sm:text-4xl text-white/20'>none</div>
                                        : (
                                            <div className='text-xl sm:text-4xl text-primary flex flex-row gap-2'>
                                                {Object.entries(config.watermarks).map(([ar, value]) => {
                                                    if (value !== "") {
                                                        return <span key={ar}>{ar}</span>;
                                                    }
                                                })}
                                            </div>
                                        )}
                                </Modal.Trigger>
                            </FormControl>
                            <Modal
                                id='graphics-modal'
                                title='graphics'
                                menu={
                                    <>
                                        <a href='https://www.figma.com/community/file/1224061680361096696/hypno-pro-graphics' target='_blank' rel="noreferrer"><h2 className='text-primary'>template</h2></a>
                                        {status && AutosaveStatusText(status)}
                                    </>
                                }
                            >
                                <div className='list pro'>
                                    <div key='blendmode'>
                                        <FormControl label='blend mode'>
                                            <select onChange={(e) => setValue('blendmode', e.target.value, { shouldDirty: true })} value={config.blendmode} className='select pl-0 w-full text-right min-h-0 h-auto font-normal lowercase bg-transparent active:bg-transparent text-xl sm:text-4xl'>
                                                {_.map(blendModes, ((o) => <option key={o.value} value={o.value}>{o.name}</option>))}
                                            </select>
                                        </FormControl>
                                    </div>
                                    {_.map(ASPECT_RATIOS, (ar, i) => (
                                        <div className='item' key={i}>
                                            <span className={`transition ${_.get(config.watermarks, ar) ? 'text-white' : 'text-white/20'}`}>{ar}</span>
                                            <FileInput
                                                inputId={ar}
                                                onInputChange={(value: string) => setValue(AspectRatioWatermark(ar), value, { shouldDirty: true })}
                                                value={_.get(config.watermarks, ar)}
                                                validateAspectRatio={ar}
                                                uploadCategory='watermark'
                                            />
                                        </div>
                                    ))}
                                </div>
                            </Modal>

                            <FormControl label='effects' featureGated={featureAccess?.effects ? undefined : 'creator'}>
                                {config.ai_generation.enabled && <Modal.Trigger id='effects-modal'><div className="tracking-tight text-xl sm:text-4xl text-primary mr-5">custom</div></Modal.Trigger>}
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('ai_generation.enabled')} />
                            </FormControl>

                            <EffectsModal
                                status={status}
                            />

                            <FormControl label='show delivery code'>
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('qr_delivery')} />
                            </FormControl>
                        </div >
                    )}

                    {
                        view == 'default' && (
                            <div className='lg:border-t-2 lg:border-white/20'>
                                <FormControl label='branded gallery' featureGated={featureAccess?.custom_branding ? undefined : 'creator'}>
                                    <input type="checkbox" className="toggle pro toggle-lg" {...register('custom_gallery_assigned')} />
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

                                <FormControl label='logo' nested={true} disabled={!config.custom_gallery_assigned}>
                                    <FileInput
                                        inputId='logo'
                                        onInputChange={(value: string) => setValue('logo_image', value, { shouldDirty: true })}
                                        value={config.logo_image}
                                        disabled={!config.custom_gallery_assigned}
                                        uploadCategory='logo'
                                    />
                                </FormControl>

                                <FormControl label='background' nested={true} disabled={!config.custom_gallery_assigned}>
                                    <FileInput
                                        inputId='background'
                                        onInputChange={(value: string) => setValue('home_background_image', value, { shouldDirty: true })}
                                        value={config.home_background_image}
                                        disabled={!config.custom_gallery_assigned}
                                        uploadCategory='background'
                                    />
                                </FormControl>

                                <FormControl label='color' nested={true} disabled={!config.custom_gallery_assigned}>
                                    <input
                                        className='input pro disabled:text-white/20 transition-colors'
                                        placeholder='# hex code'
                                        disabled={!config.custom_gallery_assigned}
                                        {...register('primary_color')} />
                                    <div className="dropdown dropdown-top dropdown-end">
                                        <label
                                            className='w-full'
                                            tabIndex={config.custom_gallery_assigned ? 0 : undefined}>
                                            <span className={clsx("inline-flex h-10 w-10 rounded-full border-4 border-white/20 cursor-pointer", !config.custom_gallery_assigned && 'opacity-50 cursor-not-allowed')} style={{ backgroundColor: `${_.startsWith(config.primary_color, '#') ? "" : "#"}${config.primary_color}` }} />
                                        </label>
                                        <div
                                            tabIndex={config.custom_gallery_assigned ? 0 : undefined}
                                            className='dropdown-content shadow mb-2 p-2 rounded-full'>
                                            <ChromePicker color={config.primary_color || '#000000'} onChange={(color: any, e: any) => { e.preventDefault(); setValue('primary_color', color.hex, { shouldDirty: true }) }} disableAlpha={true} />
                                        </div>
                                    </div>
                                </FormControl>

                                {/* <FormControl label='magic button' nested={true} disabled={!config.custom_gallery}>
                                {config.enable_magic_button && config.custom_gallery && <Modal.Trigger id='magic-button-modal'><div className="tracking-tight text-xl sm:text-4xl text-primary mr-5">custom</div></Modal.Trigger>}
                                <input type="checkbox" className="toggle pro toggle-lg" disabled={!config.custom_gallery} {...register('enable_magic_button')} />
                            </FormControl> */}

                                <FormControl label='private' nested={true} disabled={!config.custom_gallery_assigned}>
                                    <input type="checkbox" className="toggle pro toggle-lg" disabled={!config.custom_gallery_assigned} {...register('is_private')} />
                                </FormControl>

                                <FormControl label='data/legal' nested={true} disabled={!config.custom_gallery_assigned} featureGated={featureAccess?.data_capture ? undefined : 'brand'}>
                                    {config.data_capture && config.custom_gallery_assigned && <Modal.Trigger id='data-modal'><div className="tracking-tight text-xl sm:text-4xl text-primary mr-5">custom</div></Modal.Trigger>}
                                    <input type="checkbox" className="toggle pro toggle-lg" disabled={!config.custom_gallery_assigned} {...register('data_capture')} />
                                </FormControl>

                                <FormControl label='domain' nested={true} disabled={!config.custom_gallery_assigned} featureGated={featureAccess?.custom_domain ? undefined : 'brand'}>
                                    <div className='text-xl sm:text-4xl text-white/20'>coming soon</div>
                                </FormControl>
                                {/* <FormControl label='legal' nested={true} disabled={!config.custom_frontend}>
                                    {config.enable_legal && config.custom_frontend && <Modal.Trigger id='legal-modal'><div className="tracking-tight text-xl sm:text-4xl text-primary mr-5" >custom</div></Modal.Trigger>}
                                    <input type="checkbox" className="toggle pro toggle-lg" disabled={!config.custom_frontend} {...register('enable_legal')} />
                                </FormControl> */}

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

                    {/* <Modal title='legal' id='legal-modal' menu={status && AutosaveStatusText(status)}>
                        <div className='border-t-2 border-white/20'>
                            <FormControl dir='col' label='terms/privacy' altLabel='this appears in your web gallery during delivery; format links like <link|https://domain.com>'>
                                <button className='ml-4 text-primary text-xl mt-3 tracking-tight' onClick={(e) => { e.preventDefault(); setValue('terms_privacy', DEFAULT_TERMS, { shouldDirty: true }) }}>reset</button>
                                <textarea className='flex-1 textarea pro left w-full leading-[1.1rem]' rows={5} {...register('terms_privacy')} />
                            </FormControl>
                        </div>
                        <div className=''>
                            <FormControl label='explicit opt-in' altLabel='this shows a checkbox'>
                                <input type="checkbox" className="toggle pro toggle-lg" {...register('explicit_opt_in')} />
                            </FormControl>
                        </div>
                    </Modal> */}

                    {/* <Modal title='magic button' id='magic-button-modal' menu={status && AutosaveStatusText(status)}>
                        <div className='border-t-2 border-white/20'>
                            <FormControl label='text'>
                                <input
                                    className='input pro flex-1'
                                    placeholder='click me'
                                    disabled={!config.enable_magic_button}
                                    {...register('magic_button_text')} />
                            </FormControl>
                            <FormControl label='url'>
                                <input
                                    className='input pro flex-1'
                                    placeholder='https://www.link.com'
                                    disabled={!config.enable_magic_button}
                                    {...register('magic_button_url')} />
                            </FormControl>
                        </div>
                    </Modal> */}

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
            </FormProvider>

            <input type="checkbox" id="terms-preview-modal" className="modal-toggle" />
            <label htmlFor="terms-preview-modal" className="modal cursor-pointer bg-white/10 mt-0">
                <label className="modal-box relative bg-black/70 backdrop-blur-sm" htmlFor="">
                    <h3 className="text-lg font-medium">Terms and Conditions Preview</h3>
                    <p className="py-4 text-white/50">{replaceLinks(config.terms_privacy)}</p>
                </label>
            </label>
        </>
    );
};

export default EventForm;
