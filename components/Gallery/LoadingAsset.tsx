const LoadingAsset = () => <div className='relative rounded-box animate-pulse odd:bg-white/20 even:bg-white/25 w-full aspect-[2/3]' />
const LoadingGrid = ({count} : {count: number}) => {
    const components = [];
    for (let i = 0; i < count; i++) {
        components.push(<LoadingAsset key={i} />);
    }

    return (
        <>{components}</>
    )
}

export {
    LoadingAsset,
    LoadingGrid,
}