import { RotatingLines } from 'react-loader-spinner';

export default function Spinner({ size = '30' }: { size?: string }) {
    return (
        <RotatingLines
            strokeColor="white"
            strokeWidth="4"
            animationDuration="1.25"
            width={size}
            visible={true}
        />
    )
}