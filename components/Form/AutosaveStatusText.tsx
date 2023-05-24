export type SaveStatus = 'ready' | 'error' | 'saving' | 'success';

export const AutosaveStatusText = (status: SaveStatus) => (
    <>
        {status == 'ready' && <h2 className='text-white/40'>ready for changes</h2>}
        {status == 'error' && <h2 className='text-red-500'>oops! error...</h2>}
        {status == 'success' && <h2 className='text-primary'>success!</h2>}
        {status == 'saving' && <h2 className='text-white'>saving...</h2>}
    </>
)