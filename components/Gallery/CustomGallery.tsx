import Image from 'next/image';
import _ from 'lodash';

type EventData = {
    name: string;
    fields: string[];
    gallery_title: string;
    gallery_subtitle: string;
    data_capture_title: string;
    data_capture_subtitle: string;
    data_capture_screen: boolean;
    terms: string;
    privacy: string;
    logo: string;
    background: string;
    color: string;
    terms_and_conditions: string;
    email_delivery: boolean;
    ai_generation: any;
}

export function CustomGallery({ event, children }: { event: EventData, children: React.ReactNode }) {
    return (
        <section className={`text-white min-h-screen`}>
            <div
                className='fixed bg-black top-0 bottom-0 left-0 w-screen h-screen'
                style={event.background ? {
                    background: `url(${event.background}) no-repeat center center fixed`,
                    backgroundSize: 'cover',
                    WebkitBackgroundSize: 'cover',
                    MozBackgroundSize: 'cover',
                    OBackgroundSize: 'cover'
                } : {}}
            />

            <div className='fixed top-0 bottom-0 left-0 right-0 overflow-x-hidden overflow-y-scroll px-6'>
                <div className='min-h-[85px] pt-[30px] w-full'>
                    <div className='flex justify-center'>
                        <Image className='h-[25px] w-auto sm:h-[30px]' src={event.logo ? event.logo : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={25} priority />
                    </div>
                </div>

                {children}
            </div>

        </section>
    )
}