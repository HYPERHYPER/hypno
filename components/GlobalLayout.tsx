import { PropsWithChildren, ReactNode } from "react";
import { GlobalNav } from "./GlobalNav";
import Link from "next/link";
import { Balancer } from "react-wrap-balancer";
import PaymentPlansModal from "./Plans/PlansModal";

type LinkItem = {
    name: string;
    slug: string; 
}

type ActionItem = {
    name: string;
    onClick: () => void; 
}

interface GlobalHeaderProps extends PropsWithChildren {
    title: string,
    returnLink?: LinkItem,
    returnAction?: ActionItem,
    right?: ReactNode;
}

const GlobalHeader = ({ title, returnLink, returnAction, right, children }: GlobalHeaderProps) => {
    return (
        <div className="mt-[80px] sm:mt-[128px] pt-[30px] flex flex-col-reverse gap-4 sm:flex-row sm:justify-between sm:items-center w-full bg-black mb-[20px] sm:mb-[40px]">
            <div className="text-white tracking-tight space-y-2 sm:space-y-4">
                <div className="flex sm:flex-row items-baseline gap-2 sm:gap-3">
                    {returnLink && <Link href={returnLink.slug}><h1 className='text-primary'>← {returnLink.name}</h1></Link>}
                    {returnAction && <button onClick={returnAction.onClick} className="tracking-tight"><h1 className='text-primary'>← {returnAction.name}</h1></button>}
                    <h1><Balancer>{title}</Balancer></h1>
                </div>
                <div className="flex flex-row gap-4 sm:gap-6 text-white/40">{children}</div>
            </div>
            <div className="sm:min-h-[120px]">
                {right}
            </div>
        </div>
    )
}

const MainContent = ({ children }: { children: ReactNode; }) => {
    return (
        <div className="w-full block mx-auto">
            <div className="space-y-8">
                {children}
            </div>
        </div>
    )
}

export default function GlobalLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="bg-black overflow-y-scroll pb-36 px-5 sm:px-8">
            <GlobalNav />
            {children}
            <PaymentPlansModal />
        </div>
    );
}

GlobalLayout.Header = GlobalHeader;
GlobalLayout.Content = MainContent;