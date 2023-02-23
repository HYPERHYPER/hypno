import Image from 'next/image';
import Link from 'next/link';

interface GalleryNavBarProps {
    name: string;
    gallerySlug?: string;
}

export default function GalleryNavBar(props: GalleryNavBarProps) {
    return (
        <nav className="relative top-0 left-0 w-full py-8 px-[90px] bg-black text-grey">
            <div className='min-h-[28px] flex flex-row justify-between'>
                <img className='h-[28px]' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"Hypno logo"} />
                <Link href={props.gallerySlug ? `/p/${props.gallerySlug}` : ''} className='text-white text-2xl hover:text-primary transition'>{props.name}</Link>
                <div>nav links</div>
            </div>
        </nav>
    )
}