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
    const { events: initialEvents, meta } = props;
    const user = useUserStore.useUser();
    const token = useUserStore.useToken();

    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events?include_last_photo=true&per_page=${meta.per_page}`;
        if (pageIndex === 0) return [url, token.access_token];
        const pageIdx = previousPageData.meta.next_page;
        return [`${url}&page=${pageIdx}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ events: initialEvents, meta }],
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
                    {/* <Modal.Trigger id='new-user-modal'><h2 className='text-primary cursor-pointer'>new user</h2></Modal.Trigger> */}
                </GlobalLayout.Header>

                {/* <NewUserModal /> */}

                <GlobalLayout.Content>
                    <div className='divider mt-0 h-1' />
                    <InfiniteScroll
                        next={() => setSize(_.last(data).meta.next_page)}
                        hasMore={size != meta.total_pages}
                        dataLength={paginatedEvents?.length}
                        loader={<></>}
                    >
                        <div className='grid grid-cols-2 sm:grid-cols-3 gap-5 lg:grid-cols-4 lg:gap-10 xl:grid-cols-5 3xl:grid-cols-6'>
                            {!_.isEmpty(paginatedEvents) ? _.map(paginatedEvents, (event, i) => (
                                <Link href={`/e/${event.id}`} key={i}>
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
                                <Link href='/e/new'>
                                    <div className='relative rounded-box bg-white/10 w-full aspect-[2/3]'>
                                        <div className='absolute bottom-0 left-0 pb-6 px-6'>
                                            <h2 className='lowercase'>make your first event!</h2>
                                        </div>
                                    </div>
                                </Link>
                            }
                            {isValidating && <LoadingGrid count={meta.per_page || 0} />}
                        </div>
                    </InfiniteScroll>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Fetch events
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events?include_last_photo=true&per_page=20`;
    const token = nookies.get(context).hypno_token;
    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false,
            },
        };
    }

    let data = {};
    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        if (res.status === 200) {
            data = res.data;
        }
    }).catch((e) => {
        console.log(e);
    })

    if (_.isEmpty(data)) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...data,
        }
    };
};

