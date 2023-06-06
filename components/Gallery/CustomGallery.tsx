import Image from 'next/image';
import _ from 'lodash';
import useHeight from '@/hooks/useHeight';
import { EventConfig } from '@/types/event';
import clsx from 'clsx';

export function CustomGallery({ event, children, logoSize = 'sm' }: { event: EventConfig, children: React.ReactNode, logoSize?: 'sm' | 'lg' }) {
    const windowHeight = useHeight();
    const { metadata: gallery } = event;
    return (
        <section className={`text-white min-h-screen relative`} style={{ minHeight: windowHeight }}>
            <div
                className='fixed bg-black top-0 bottom-0 left-0 w-screen h-screen'
                style={gallery?.background ? {
                    background: `url(${gallery.background}) no-repeat center center fixed`,
                    backgroundSize: 'cover',
                    WebkitBackgroundSize: 'cover',
                    MozBackgroundSize: 'cover',
                    OBackgroundSize: 'cover',
                    height: windowHeight,
                } : {}}
            />

            <div className='absolute top-0 bottom-0 left-0 right-0 flex flex-col overflow-x-hidden overflow-y-scroll'>
                <div className='w-full'>
                    <div className='flex justify-center'>
                        <Image className={clsx('w-auto py-[25px] transition', logoSize == 'sm' ? 'max-h-[50vw] sm:max-h-[22vw] max-w-[33vw]' : 'max-h-[60vw] sm:max-h-[22vw]')} src={gallery?.logo ? gallery.logo : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={25} priority />
                    </div>
                </div>

                {children}
            </div>

        </section>
    )
}