import axios from "axios";
import type { GetServerSideProps } from "next";
import Head from "next/head";
import _ from "lodash";
import useSWRInfinite from "swr/infinite";
import { fetchWithToken } from "@/lib/fetchWithToken";
import { CustomGallery } from "@/components/Gallery/CustomGallery";
import InfiniteMediaGrid from "@/components/Gallery/InfiniteMediaGrid";
import { EventConfig } from "@/types/event";
import { getPlaiceholder } from "plaiceholder";

type ImageData = {
  id: number;
  event_id: number;
  event_name: string;
  slug: string;
  media_slug: string;
  state: string;
  url: string;
  jpeg_url: string;
  jpeg_thumb_url: string;
  jpeg_3000_thumb_url: string;
  posterframe: string;
  gif: string;
  ipad_id: number;
  uploaded: string;
  updated_at: string;
  moderated: boolean;
  captured_at: string;
  format_generation: string; //(actually a number in quotes)
  grizzly_url: string;
  download_url: string;
  hi_res_url: string; //not in use
  raw_asset_url: string;
  raw_asset_mp4_url: string; // not in use
  metadata: Object; // need to type?
  export: boolean;
  export_settings: Object; //need to type
  width: number;
  height: number;
};

interface PhotosResponse {
  photos: ImageData[];
  meta: {
    total_count: number;
    next_page?: string;
    per_page?: number;
  };
}

interface ResponseData {
  photos: PhotosResponse;
  event: EventConfig;
}

const PublicGallery = (props: ResponseData) => {
  const { photos: photosRes, event } = props;
  const { name, id } = event;
  const { photos, meta } = photosRes;

  const galleryTitle = event.name;

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData?.meta.next_page) return null; // reached the end
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${id}/photos?per_page=${meta.per_page}`;
    if (pageIndex === 0) return [url, process.env.NEXT_PUBLIC_AUTH_TOKEN];
    return [
      `${previousPageData.meta.next_page}`,
      process.env.NEXT_PUBLIC_AUTH_TOKEN,
    ];
  };

  const { data, size, setSize, error, isLoading } = useSWRInfinite(
    getKey,
    ([url, token]) => fetchWithToken(url, token),
    {
      fallbackData: [{ photosRes }],
    },
  );

  const paginatedPhotos = !_.isEmpty(_.first(data).photos)
    ? _.map(data, (v) => v.photos).flat()
    : [];
  const hasMorePhotos = meta?.total_count != paginatedPhotos?.length;

  if (isLoading || !paginatedPhotos) return <div></div>;
  return (
    <>
      <Head>
        <title>{galleryTitle + " | hypno™" || "hypno™"}</title>
        <meta
          name="description"
          content="Taken with HYPNO: The animated, social photo booth"
        />
      </Head>

      {/* <GalleryNavBar name={galleryTitle} gallerySlug={String(gallerySlug)}> */}
      {/* <div className='flex flex-row gap-3 items-center text-lg invisible'>
                    <Link href={'/'}>Newest</Link>
                    <Link href={'/'}>Oldest</Link>
                </div> */}
      {/* </GalleryNavBar> */}
      <CustomGallery event={event}>
        <section className={`text-white min-h-[100vh-85px]`}>
          <InfiniteMediaGrid
            next={() => setSize(size + 1)}
            hasMore={hasMorePhotos}
            assets={paginatedPhotos}
            data={data}
            detailBaseUrl={`/i/`}
          />
        </section>
      </CustomGallery>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.query;

  // Fetch event config + event photos
  const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
  const photosUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}/photos`;
  const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  let eventData: any = {};
  let photosData: any = {};

  try {
    const [eventRes, photosRes] = await Promise.all([
      axios.get(eventUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }),
      axios.get(photosUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }),
    ]);

    if (eventRes.status === 200) {
      eventData = eventRes.data;
    }

    if (photosRes.status === 200) {
      const photos = await Promise.all(
        photosRes.data.photos.map(async (photo: any) => {
          const placeholder = await getPlaiceholder(photo.posterframe);
          return {
            ...photo,
            blurDataURL: placeholder.base64,
          };
        }),
      );
      photosData = { ...photosRes.data, photos };
    }
  } catch (e) {
    console.log(e);
  }

  if (_.isEmpty(eventData)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...eventData,
      photos: {
        ...photosData,
      },
    },
  };
};

export default PublicGallery;
