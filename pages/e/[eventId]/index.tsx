import Head from 'next/head'
import _ from 'lodash';
import useUserStore from '@/store/userStore';
import withAuth from '@/components/hoc/withAuth';
import GlobalLayout from '@/components/GlobalLayout';
import Link from 'next/link';
import axios from 'axios';
import { GetServerSideProps } from 'next';
import nookies from 'nookies'
import Image from 'next/image'
import Trash from 'assets/icons/trash.svg'
import Hide from 'assets/icons/hide.svg'
import Favorite from 'assets/icons/favorite.svg'
import Share from 'assets/icons/share.svg'
import Save from 'assets/icons/save.svg'
import Play from 'assets/icons/play.svg'
import { getPlaiceholder } from 'plaiceholder';

interface ResponseData {
    event: any;
    photos: any;
}

function EventPage(props: ResponseData) {
    const { event, photos } = props;
    const { name, id } = event;

    return (
        <>
            <Head>
                <title>{name} | hypno™</title>
                <meta name="description" content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <GlobalLayout>
                <GlobalLayout.Header
                    title={name}
                    right={
                        <div className='avatar placeholder'>
                            <div className="rounded-xl bg-white text-white w-[120px]">
                                <img src={`https://pro.hypno.com/api/v1/events/${event.id}/short_qr_code.png`} alt='QR Code' />
                            </div>
                        </div>
                    }
                >
                    <h2>{photos.count} posts</h2>
                    <Link href={`/e/${id}`}><h2 className='text-white'>all</h2></Link>
                    <Link href=''><h2 className='text-primary'>favorites</h2></Link>
                    <Link href=''><h2 className='text-primary'>data</h2></Link>
                    <Link href={`/e/${id}/edit`}><h2 className='text-primary'>edit</h2></Link>
                </GlobalLayout.Header>
                <GlobalLayout.Content>
                    <div className='divider' />
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-5 lg:grid-cols-4 lg:gap-10 xl:grid-cols-5 3xl:grid-cols-6'>
                        {_.map(photos.photos, (p, i) => (
                            <Link href={`/i/${p.slug}`} key={i} className='rounded-box'>
                                <div className='group relative rounded-box bg-white/10 w-full aspect-[2/3] overflow-hidden'>
                                    <div className='absolute inset-0 hover:scale-110 transition rounded-box'>
                                        {/* <div
                                            className='absolute top-0 left-0 w-full h-full rounded-box'
                                            style={{ backgroundImage: `url(${p.gif ? p.posterframe : p.jpeg_thumb_url})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
                                        /> */}
                                        <Image
                                            className='absolute top-0 left-0 w-full h-full rounded-box object-cover'
                                            priority={Number(i) < 10}
                                            src={p.gif ? p.posterframe : p.jpeg_thumb_url}
                                            fill
                                            alt={p.event_name + p.id}
                                            placeholder={p.blurDataURL ? 'blur' : 'empty'}
                                            blurDataURL={p.blurDataURL || undefined}
                                        />
                                        {p.gif &&
                                            <div
                                                className='absolute top-0 left-0 w-full h-full animate-jpeg-strip'
                                                style={{ backgroundImage: `url(${p.jpeg_url})`, backgroundSize: '100% 500%' }}
                                            />
                                        }
                                    </div>
                                    <div
                                        style={{ background: '-webkit-linear-gradient(top, rgba(0,0,0,0.65), rgba(0,0,0,0))' }}
                                        className='opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 w-full h-full z-10 p-5 rounded-box'>
                                        <div className='flex flex-row justify-between text-white'>
                                            <button><Trash /></button>
                                            <button><Hide /></button>
                                            <button><Favorite /></button>
                                            <button><Save /></button>
                                            <button><Share /></button>
                                        </div>

                                        {p.gif && (
                                            <div className='absolute top-0 left-0 flex items-center justify-center h-full w-full'>
                                                <button><Play /></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </GlobalLayout.Content>
            </GlobalLayout>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId } = context.query;

    // Fetch event config
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${eventId}`;
    const token = nookies.get(context).hypno_token;
    let eventData: any = {};
    let photosData: any = {};
    await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then(async (res) => {
        if (res.status === 200) {
            eventData = await res.data;
            const eventSlug = eventData.event.party_slug;

            // Fetch event photos
            const photosUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/events/${eventSlug}/photos.json`;
            await axios.get(photosUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            }).then(async (photosRes) => {
                if (photosRes.status === 200) {
                    const photos = await Promise.all(
                        photosRes.data.photos.map(async (photo: any) => {
                            const placeholder = await getPlaiceholder(photo.jpeg_url);
                            return {
                                ...photo,
                                blurDataURL: placeholder.base64,
                            };
                        })
                    );
                    photosData = { ...photosRes.data, photos };
                }
            })
        }
    }).catch((e) => {
        console.log(e);
    })

    if (_.isEmpty(eventData)) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            ...eventData,
            photos: {
                ...photosData,
            }
        }
    };
};

export default withAuth(EventPage, 'protected');
