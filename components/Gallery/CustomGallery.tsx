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
        <section
            className={`text-white bg-black min-h-screen p-10 ${!_.isEmpty(event.logo) && 'pt-0'}`}
            style={event.background ? {
                background: `url(${event.background}) no-repeat center center fixed`,
                backgroundSize: 'cover',
                WebkitBackgroundSize: 'cover',
                MozBackgroundSize: 'cover',
                //@ts-ignore
                '-o-background-size': 'cover'
            } : {}}>

            <div className='min-h-[50px] translate-y-1/2'>
                <div className='flex justify-center'>
                    <Image className='h-auto' src={event.logo ? event.logo : 'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={event.name + " logo"} width={150} height={150} priority />
                </div>
            </div>

            {children}

        </section>
    )
}