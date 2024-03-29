import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import nookies from 'nookies'
import Modal from '@/components/Modal';
import InfiniteScroll from 'react-infinite-scroll-component';
import NewUserModal from '@/components/Users/NewUserModal';
import { fetchWithToken } from '@/lib/fetchWithToken';
import useSWRInfinite from 'swr/infinite';
import { LoadingGrid } from '@/components/Gallery/LoadingAsset';
import { useRouter } from 'next/router';
import ArrowUp from 'public/pop/angle-up.svg';
import ArrowDown from 'public/pop/angle-down.svg';
import clsx from 'clsx';

interface ResponseData {
    events: any;
    meta: {
        total_pages?: number,
        current_page?: number,
        next_page?: number,
        prev_page?: number,
        per_page?: number,
    };
}

export default withAuth(DashboardPage, 'protected');
function DashboardPage(props: ResponseData) {
    // const { events: initialEvents, meta } = props;
    // const user = useUserStore.useUser();
    const token = useUserStore.useToken();
    const { query } = useRouter();
    const sort_order = query.order || 'desc';
    const sort_by = query.by || 'last_uploaded_at';
    const sort_by_name = _.split(String(sort_by), '_')[0];
    const event_type = query.type || '';
    const event_type_code = _.isEmpty(event_type) ? '' : (event_type == 'pro' ? '100' : '102')

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events?include_last_photo=true&per_page=25&sort_by=${sort_by}&sort_order=${sort_order}&event_type=${event_type_code}`;
        if (pageIndex === 0) return [url, token.access_token];
        const pageIdx = previousPageData.meta.next_page;
        return [`${url}&page=${pageIdx}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating, isLoading } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ events: [] }],
    });

    const paginatedEvents = _.map(data, (v) => v.events).flat();

    return (
        <>
            <Head>
                <title>dashboard | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title='dashboard'
                >
                    <Link href='/e/new' className='text-primary'><h2>new event</h2></Link>
                    
                    <div className="dropdown text-primary">
                        <label tabIndex={0} className='cursor-pointer'><h2>{_.isEmpty(event_type) ? 'all' : event_type} events</h2></label>
                        <ul tabIndex={0} className="dropdown-content sm:text-lg z-[1] menu p-2 shadow bg-black/20 backdrop-blur rounded-box w-32 sm:w-52">
                            <li className='disabled'><a>filter by</a></li>
                            <li><Link href={`/dashboard?by=${sort_by}&order=${sort_order}`}>none</Link></li>
                            <li><Link href={`/dashboard?by=${sort_by}&order=${sort_order}&type=pro`}>pro events</Link></li>
                            <li><Link href={`/dashboard?by=${sort_by}&order=${sort_order}&type=ipad`}>ipad events</Link></li>
                        </ul>
                    </div>

                    <div className='text-primary flex items-center gap-1 sm:gap-3'>
                        <div className="dropdown">
                            <label tabIndex={0} className='cursor-pointer'><h2>{sort_by_name == 'last' ? 'updated' : sort_by_name}</h2></label>
                            <ul tabIndex={0} className="dropdown-content sm:text-lg z-[1] menu p-2 shadow bg-black/20 backdrop-blur rounded-box w-32 sm:w-52">
                                <li className='disabled'><a>sort by</a></li>
                                <li><Link href={`/dashboard?by=created_at&order=${sort_order}`}>created at</Link></li>
                                <li><Link href={`/dashboard?by=last_uploaded_at&order=${sort_order}`}>updated at</Link></li>
                                <li><Link href={`/dashboard?by=name&order=${sort_order}`}>name</Link></li>
                            </ul>
                        </div>
                        <Link href={`/dashboard?by=${sort_by}&order=${sort_order == 'asc' ? 'desc' : 'asc'}`}>
                            <div className={clsx('swap swap-rotate sm:scale-150', sort_order == 'asc' ? 'swap-active' : '')}>
                                <span className='swap-off'><ArrowDown /></span>
                                <span className='swap-on'><ArrowUp /></span>
                            </div>
                        </Link>
                    </div>
                </GlobalLayout.Header>

                <GlobalLayout.Content>
                    <div className='divider mt-0 h-1' />
                    <InfiniteScroll
                        next={() => setSize((prev) => _.last(data).meta?.next_page || prev + 1)}
                        hasMore={size != (_.first(data)?.meta?.total_pages || 0)}
                        dataLength={paginatedEvents?.length}
                        loader={<></>}
                    >
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-5 lg:grid-cols-4 lg:gap-10 xl:grid-cols-5 3xl:grid-cols-6'>
                            {!_.isEmpty(paginatedEvents) ? _.map(paginatedEvents, (event, i) => (
                                <Link href={`/e/${event.id}`} as={`/e/${event.id}`} key={i}>
                                    <div
                                        style={event.most_recent ?
                                            { backgroundImage: `url(${event.most_recent.service_urls.posterframe})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }
                                            : {}}
                                        className='relative rounded-box bg-white/10 w-full aspect-[2/3]'>
                                        <div
                                            style={{ background: '-webkit-linear-gradient(bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))' }}
                                            className='absolute bottom-0 left-0 right-0 pb-4 px-4 sm:pb-6 sm:px-6 h-1/4 flex items-end'>
                                            <h2 className='lowercase text-white leading-4 sm:leading-8'>{event.name}</h2>
                                        </div>
                                    </div>
                                </Link>
                            )) :
                                !isValidating && <Link href='/e/new'>
                                    <div className='relative rounded-box bg-white/10 w-full aspect-[2/3]'>
                                        <div className='absolute bottom-0 left-0 pb-6 px-6'>
                                            <h2 className='lowercase'>make your first event!</h2>
                                        </div>
                                    </div>
                                </Link>
                            }
                            {isValidating && <LoadingGrid count={10} />}
                        </div>
                    </InfiniteScroll>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Fetch events
    // const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events?include_last_photo=true&per_page=20`;
    // const token = nookies.get(context).hypno_token;
    // if (!token) {
    //     return {
    //         redirect: {
    //             destination: '/login',
    //             permanent: false,
    //         },
    //     };
    // }

    let data = {};
    // LOAD INITIAL DATA USING USESWR FOR RESPONSIVE NAVIGATION
    // await axios.get(url, {
    //     headers: {
    //         'Content-Type': 'application/json',
    //         Authorization: 'Bearer ' + token,
    //     },
    // }).then(async (res) => {
    //     if (res.status === 200) {
    //         data = res.data;
    //     }
    // }).catch((e) => {
    //     console.log(e);
    // })

    // if (_.isEmpty(data)) {
    //     return {
    //         notFound: true,
    //     }
    // }

    return {
        props: {
            // ...data,
        }
    };
};

