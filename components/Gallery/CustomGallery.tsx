import Image from 'next/image';
import _ from 'lodash';
import useHeight from '@/hooks/useHeight';
import { EventConfig } from '@/types/event';
import clsx from 'clsx';
import Link from 'next/link';

interface CustomGalleryProps {
    event: EventConfig;
    children: React.ReactNode;
    logoSize?: 'sm' | 'lg';
    galleryBanner?: boolean;
}

export function CustomGallery({ event, children, logoSize = 'sm', galleryBanner }: CustomGalleryProps) {
    const windowHeight = useHeight();
    const { custom_frontend: gallery } = event;
    return (
        <section className={`text-white min-h-screen relative`} style={{ minHeight: windowHeight }}>
            <div
                className='fixed bg-black top-0 bottom-0 left-0 w-screen h-screen'
                style={gallery?.home_background_image ? {
                    background: `url(${gallery.home_background_image}) no-repeat center center fixed`,
                    backgroundSize: 'cover',
                    WebkitBackgroundSize: 'cover',
                    MozBackgroundSize: 'cover',
                    OBackgroundSize: 'cover',
                    height: windowHeight,
                } : {}}
            />

            {galleryBanner && <Link href={`/pro/${event.id}/p`} className='absolute top-0 left-0 right-0 p-2 w-full bg-black/10 backdrop-blur-[30px] z-10 text-center transition hover:bg-black/[.08]'><h3 className='font-medium'>browse the gallery →</h3></Link>}
            
            <div id='custom-gallery-parent' className={clsx('absolute pb-6 sm:pb-6 top-0 bottom-0 left-0 right-0 flex flex-col overflow-x-hidden overflow-y-scroll', galleryBanner && 'pt-6')}>
                <div className='w-full'>
                    <div className='flex justify-center'>
                        <Image className={clsx('w-auto py-[25px] transition', logoSize == 'sm' ? 'max-h-[50vw] sm:max-h-[22vw] max-w-[33vw]' : 'max-h-[60vw] sm:max-h-[22vw]')} src={gallery?.logo_image ? gallery.logo_image : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={25} priority />
                    </div>
                </div>

                {children}
            </div>

        </section>
    )
}