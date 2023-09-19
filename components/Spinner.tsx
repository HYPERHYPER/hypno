import clsx from 'clsx';
import { MutatingDots } from 'react-loader-spinner';

export default function Spinner({ size = '', color = '' }: { size?: string, color?: 'text-primary' | '' }) {
    return (
        <span className={clsx('loading loading-spinner', color && color, size && size)} />
    )
}

export function DotsSpinner({ size = '', color = '' }: { size?: string, color?: 'text-primary' | '' }) {
    return (
        <MutatingDots
            height="100"
            width="100"
            color="#FFF"
            secondaryColor='#FFF'
            radius='10'
            ariaLabel="mutating-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />)
}