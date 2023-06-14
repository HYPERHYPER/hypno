import clsx from 'clsx';
import { RotatingLines } from 'react-loader-spinner';

export default function Spinner({ size = '', color = '' }: { size?: string, color?: 'text-primary' | '' }) {
    return (
        // <RotatingLines
        //     strokeColor="white"
        //     strokeWidth="4"
        //     animationDuration="1.25"
        //     width={size}
        //     visible={true}
        // />
        <span className={clsx('loading loading-spinner', color && color, size && size)} />
    )
}