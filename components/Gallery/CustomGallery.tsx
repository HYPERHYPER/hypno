import Image from 'next/image';
import _ from 'lodash';
import useHeight from '@/hooks/useHeight';
import { EventConfig } from '@/types/event';

export function CustomGallery({ event, children }: { event: EventConfig, children: React.ReactNode }) {
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

            <div className='fixed top-0 bottom-0 left-0 right-0 flex flex-col overflow-x-hidden overflow-y-scroll'>
                <div className='w-full'>
                    <div className='flex justify-center'>
                        <Image className='max-h-[22vw] max-w-[33vw] w-auto py-[25px]' src={gallery?.logo ? gallery.logo : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={25} priority />
                    </div>
                </div>

                {children}
            </div>

        </section>
    )
}