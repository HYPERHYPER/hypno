import Image from 'next/image';
import Link from 'next/link';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import useUserStore from '@/store/userStore';
import { useRouter } from 'next/router';

type Item = {
    name?: string;
    slug?: string;
}

export function GlobalNav() {
    const user = useUserStore.useUser();

    const [isOpen, setIsOpen] = useState(false);
    const close = () => setIsOpen(false);

    if (typeof window === 'undefined') return null;
    return (
        <div 
            className="fixed top-0 left-0 right-0 z-10 flex flex-row justify-between w-full py-2 sm:py-6 px-5 sm:px-8"
            style={{ background: '-webkit-linear-gradient(top, rgba(0,0,0,1), rgba(0,0,0,0))' }}
            >
            <div className="flex items-center lg:h-auto">
                <Link
                    href="/"
                    className="group flex w-full items-center gap-x-2.5"
                    onClick={close}
                >
                    <div className="">
                        <Image className='h-[70px] w-auto sm:h-[80px] py-[25px]' src={'https://hypno-web-assets.s3.amazonaws.com/hypno-logo-white-drop.png'} alt={"hypno™ logo"} width={75} height={25} priority />
                    </div>
                </Link>
            </div>

            <div
                className={clsx('lg:static lg:block', {
                    'fixed inset-x-0 bottom-0 top-14 mt-px bg-black': isOpen,
                    // hidden: !isOpen,
                })}
            >
                {user && (
                    <nav className="h-full flex flex-row items-center gap-3 sm:gap-5 tracking-tight">
                        <GlobalNavItem key='dashboard' item={{ slug: 'dashboard', name: 'dashboard' }} close={close} />
                        <GlobalNavItem key='settings' item={{ slug: 'settings', name: 'settings' }} close={close} />
                        <div className='hidden sm:block avatar placeholder'>
                            <div className="bg-white/20 text-white rounded-full w-[40px]">
                                <span className="text-xl uppercase">{user.first_name.charAt(0)}</span>
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        </div>
    );
}

function GlobalNavItem({
    item,
    close,
}: {
    item: Item;
    close: () => false | void;
}) {
    const {pathname} = useRouter();
    const segment = pathname.split('/')[1];
    const isActive = item.slug === segment;

    return (
        <Link
            onClick={close}
            href={`/${item.slug}`}
            className={clsx(
                'block rounded-md text-lg sm:text-xl transition',
                {
                    'text-primary hover:text-white': !isActive,
                    'text-white': isActive,
                },
            )}
        >
            {item.name}
        </Link>
    );
}