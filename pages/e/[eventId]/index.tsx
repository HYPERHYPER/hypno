import Head from "next/head";
import _ from "lodash";
import useUserStore from "@/store/userStore";
import withAuth from "@/components/hoc/withAuth";
import GlobalLayout from "@/components/GlobalLayout";
import Link from "next/link";
import axios from "axios";
import { GetServerSideProps } from "next";
import nookies from "nookies";
import Image from "next/image";
import Trash from "assets/icons/trash.svg";
import Hide from "assets/icons/hide.svg";
import Favorite from "assets/icons/favorite.svg";
import FavoriteFilled from "assets/icons/favoriteFilled.svg";
import Share from "assets/icons/share.svg";
import Save from "assets/icons/save.svg";
import Play from "assets/icons/play.svg";
import { getPlaiceholder } from "plaiceholder";
import useSWRInfinite from "swr/infinite";
import { axiosGetWithToken, fetchWithToken } from "@/lib/fetchWithToken";
import InfiniteScroll from "react-infinite-scroll-component";
import { LoadingGrid } from "@/components/Gallery/LoadingAsset";
import { useRouter } from "next/router";
import ScanQRModal from "@/components/Events/ScanQRModal";
import Modal from "@/components/Modal";
import useAssetManager from "@/hooks/useAssetManager";
import clsx from "clsx";
import { useCallback, useContext, useEffect, useState } from "react";
import Spinner from "@/components/Spinner";
import DataDownloadModal from "@/components/Events/DataDownloadModal";
import useSWR from "swr";
import {
  PrivilegeContext,
  PrivilegeProvider,
} from "@/components/PrivilegeContext/PrivilegeContext";
import { getEventPrivileges } from "@/helpers/user-privilege";
import ArchiveEventModal from "@/components/Events/ArchiveEventModal";
import { downloadPhoto, getAspectRatio } from "@/helpers/image";
import ContentDownloadModal from "@/components/Events/ContentDownloadModal";
import { formatTimestamp } from "@/helpers/date";
import DuplicateEventModal from "@/components/Events/DuplicateEventModal";
import { hashEncode } from "@/helpers/hashHelper";

type PhotosResponse = {
  photos: any;
  meta: {
    total_count: number;
    next_page?: string;
    per_page?: number;
  };
};

interface ResponseData {
  event: any;
  photos: PhotosResponse;
}

// function GridImage({ src, alt, priority }: { src: string, alt: string, priority?: boolean }) {
//     const [blurDataURL, setBlurDataURL] = useState<string>('');

//     useEffect(() => {
//         const getBlurDataUrl = async () => {
//             const res = await fetch(`/api/image?url=${src}`);
//             const placeholderData = await res.json();
//             setBlurDataURL(placeholderData.base64);
//         }

//         getBlurDataUrl();
//     }, [])

//     return (
//         <Image
//             className='absolute top-0 left-0 w-full h-full rounded-box object-cover'
//             priority={priority}
//             src={src}
//             fill
//             alt={alt}
//             placeholder={blurDataURL ? 'blur' : 'empty'}
//             blurDataURL={blurDataURL || undefined}
//         />
//     )
// }

const AdminAsset = ({
  asset,
  onSuccess,
  filetypeDownload,
}: {
  asset?: any;
  onSuccess?: () => void;
  filetypeDownload?: string;
}) => {
  const { isFavorited, isHidden, archiveAsset, toggleFavorited, toggleHidden } =
    useAssetManager(asset);

  const { userPrivileges } = useContext(PrivilegeContext);

  const [archiveModal, setArchiveModal] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const handlePhotoDownload = () => {
    downloadPhoto(asset);
  };

  return (
    <>
      <div
        className="rounded-box group relative z-0 w-full overflow-hidden bg-white/10"
        style={{
          aspectRatio: getAspectRatio(asset.width, asset.height) || 0.666,
        }}
      >
        <Link
          href={`/i/${asset.slug}`}
          className={clsx(
            "rounded-box absolute inset-0 transition duration-300 hover:scale-105",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
        >
          {asset.posterframe && (
            <Image
              className="rounded-box absolute left-0 top-0 h-full w-full object-cover transition"
              src={asset.posterframe}
              fill
              alt={`${asset.event_slug}-${asset.id}` || ""}
              placeholder={asset.blurDataURL ? "blur" : "empty"}
              blurDataURL={asset.blurDataURL || undefined}
              sizes="(min-width: 1280px) 20%, (min-width: 1024px) 25%, (min-width: 768px) 33.33%, 50vw"
              onLoadingComplete={() => setIsLoaded(true)}
            />
          )}
          {(asset.gif || asset.mp4_url) &&
            filetypeDownload !== "posterframe" && (
              <div
                className="animate-jpeg-strip absolute left-0 top-0 h-full w-full"
                style={{
                  backgroundImage: `url(${asset.urls.jpeg_url})`,
                  backgroundSize: "100% 500%",
                }}
              />
            )}
        </Link>

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}

        {archiveModal ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-md transition">
            <div className="m-4 rounded-2xl bg-black p-4">
              <h4 className="mb-3 text-center">archive asset?</h4>
              <div className="flex flex-row justify-between gap-2">
                <button
                  className="btn btn-neutral btn-xs flex-1 rounded-2xl"
                  onClick={() => setArchiveModal(false)}
                >
                  cancel
                </button>
                <button
                  className="btn btn-error btn-xs flex-1 rounded-2xl"
                  onClick={() => {
                    archiveAsset();
                    setArchiveModal(false);
                    onSuccess && onSuccess();
                  }}
                >
                  confirm
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {(isHidden || (userPrivileges?.canLikePhoto && isFavorited)) && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:opacity-0">
                <span className="flex scale-[1.75] flex-row">
                  {isHidden && <Hide />}
                  {isFavorited && <FavoriteFilled />}
                </span>
              </div>
            )}

            <div
              style={{
                background:
                  "-webkit-linear-gradient(top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
              }}
              className="rounded-box pointer-events-none absolute left-0 top-0 z-10 h-full w-full px-2 py-4 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <div className="pointer-events-auto flex flex-row flex-wrap justify-between gap-0.5 text-white sm:gap-0">
                {userPrivileges?.canArchivePhoto && (
                  <button
                    className="cursor-pointer rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md"
                    onClick={() => setArchiveModal(true)}
                  >
                    <Trash />
                  </button>
                )}
                {userPrivileges?.canModeratePhoto && (
                  <button
                    className={clsx(
                      "rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md",
                      isHidden && "bg-white/10 backdrop-blur-md",
                    )}
                    onClick={() => {
                      toggleHidden();
                    }}
                  >
                    <Hide />
                  </button>
                )}
                {userPrivileges?.canLikePhoto && (
                  <button
                    className={clsx(
                      "rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md",
                      isFavorited && "bg-white/10 backdrop-blur-md",
                    )}
                    onClick={() => {
                      toggleFavorited();
                    }}
                  >
                    {isFavorited ? <FavoriteFilled /> : <Favorite />}
                  </button>
                )}
                {asset.mp4_url ? (
                  <a
                    href={asset.download_url}
                    className="cursor-pointer rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md"
                  >
                    <Save />
                  </a>
                ) : (
                  <button
                    onClick={handlePhotoDownload}
                    className="cursor-pointer rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md"
                  >
                    <Save />
                  </button>
                )}
                <Link
                  href={`/pro/${asset.event_slug}?i=${asset.id}`}
                  className="rounded-full p-2 transition hover:bg-white/10 hover:backdrop-blur-md"
                >
                  <Share />
                </Link>
                <span className="text-white lowercase px-3 py-2 font-normal text-lg">
                  {formatTimestamp(asset.captured_at)}
                </span>
              </div>

              {asset.gif && (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
                  <button>
                    <Play />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

const isProEvent = (eventType: string) => eventType === "hypno_pro";

function EventPage(props: ResponseData) {
  const router = useRouter();
  const { query } = router;
  const { event: initialEvent } = props;

  const token = useUserStore.useToken();

  const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(query.eventId)}`;
  const {
    data: eventData,
    isValidating: isValidatingEventData,
    error: eventError,
  } = useSWR([eventUrl, token.access_token], ([url, token]) =>
    axiosGetWithToken(url, token),
  );

  const event = initialEvent || eventData?.event;
  const id = event?.id || "";
  const name = event?.name || "";

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData?.meta.next_page) return null; // reached the end
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${query.eventId}/photos?per_page=20`;
    if (pageIndex === 0) return [url, token.access_token];
    return [`${previousPageData.meta.next_page}`, token.access_token];
  };

  const { data, size, setSize, error, isValidating, mutate } = useSWRInfinite(
    getKey,
    ([url, token]) => fetchWithToken(url, token),
    {
      fallbackData: [
        { photos: [], meta: { total_count: 0, next_page: null, per_page: 20 } },
      ],
      revalidateAll: true,
    },
  );

  const totalCount = _.first(data)?.meta?.total_count || 0;
  const paginatedPhotos = !_.isEmpty(_.first(data).photos)
    ? _.map(data, (v) => v.photos).flat()
    : [];
  const hasMorePhotos = totalCount != paginatedPhotos?.length;

  const onArchive = useCallback(
    (assetId: number) => {
      if (!_.isEmpty(data)) {
        const assetIndexToRemove = paginatedPhotos.findIndex(
          (item) => item.id === assetId,
        );
        const assetPage = Math.floor(
          assetIndexToRemove / (_.first(data)?.meta?.per_page || 10),
        );
        const photosToUpdate = data && data[assetPage].photos;
        const idxInPage = assetIndexToRemove % 10;
        const updatedPhotos = [
          ...photosToUpdate.slice(0, idxInPage),
          ...photosToUpdate.slice(idxInPage + 1),
        ];
        let updatedData = data || [];
        updatedData[0] = {
          ...updatedData[0],
          meta: {
            ...updatedData[0].meta,
            total_count: updatedData[0].meta.total_count - 1,
          },
        };
        updatedData[assetPage] = {
          photos: updatedPhotos,
          meta: updatedData[assetPage].meta,
        };
        mutate(updatedData);
      }
    },
    [data],
  );

  useEffect(() => {
    if (eventError) {
      router.push("/404");
    }
  }, [eventError]);

  const userEventPrivileges = event
    ? getEventPrivileges(event.user_privileges)
    : null;

    
  const shareableGalleryUrl = event ? `/gallery/${hashEncode(event.id)}` : ''

  if (!event && isValidatingEventData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <span className="loading loading-ring loading-lg text-primary sm:w-[200px]"></span>
      </div>
    );
  }
  return (
    <>
      <Head>
        <title>{name} | hypno™</title>
        <meta
          name="description"
          content="shoot + share professionally branded content — in seconds — from live events, shoots, stores and more. trusted by NBA, Dolby, TikTok, Apple, Bacardi, New Balance and other world-class brands."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PrivilegeProvider privileges={userEventPrivileges}>
        <GlobalLayout>
          <GlobalLayout.Header
            title={name}
            right={
              <Modal.Trigger id="scan-qr-modal">
                <div className="avatar placeholder">
                  <div className="w-[120px] rounded-xl bg-white text-white">
                    <img
                      src={`https://pro.hypno.com/api/v1/events/${id}/short_qr_code.png`}
                      alt="QR Code"
                    />
                  </div>
                </div>
              </Modal.Trigger>
            }
          >
            <h2>{totalCount} posts</h2>
            {/* <Link href={`/pro/${id}/p`}><h2 className='text-primary'>public gallery</h2></Link> */}
            {/* <Link href={`/e/${id}`}><h2 className='text-white'>all</h2></Link> */}
            {/* <Link href=''><h2 className='text-primary'>favorites</h2></Link> */}
            {isProEvent(event.event_type) && (
              <Link href={shareableGalleryUrl}>
                <h2 className="text-primary">gallery</h2>
              </Link>
            )}
            {userEventPrivileges?.canDownloadData && (
              <Modal.Trigger id="data-download-modal">
                <h2 className="text-primary">data</h2>
              </Modal.Trigger>
            )}
            {userEventPrivileges?.canDownloadData && (
              <Modal.Trigger id="duplicate-event-modal">
                <h2 className="text-primary">duplicate</h2>
              </Modal.Trigger>
            )}
            {userEventPrivileges?.canDownloadContent && (
              <Modal.Trigger id="content-download-modal">
                <h2 className="text-primary">download</h2>
              </Modal.Trigger>
            )}
            {isProEvent(event.event_type) &&
              userEventPrivileges?.canEditEvent && (
                <Link href={`/e/${id}/edit`}>
                  <h2 className="text-primary">edit</h2>
                </Link>
              )}
            {isProEvent(event.event_type) &&
              userEventPrivileges?.canArchiveEvent && (
                <Modal.Trigger id="archive-event-modal">
                  <h2 className="text-primary">archive</h2>
                </Modal.Trigger>
              )}
          </GlobalLayout.Header>

          <ScanQRModal eventId={id} eventName={name} modalId="scan-qr-modal" />
          {userEventPrivileges?.canDownloadData && (
            <DataDownloadModal modalId="data-download-modal" eventId={id} />
          )}
          {userEventPrivileges?.canDownloadData && (
            <DuplicateEventModal
              modalId="duplicate-event-modal"
              eventId={id}
              eventName={name}
            />
          )}
          {userEventPrivileges?.canDownloadContent && (
            <ContentDownloadModal
              modalId="content-download-modal"
              eventId={id}
            />
          )}
          {userEventPrivileges?.canArchiveEvent && (
            <ArchiveEventModal modalId="archive-event-modal" eventId={id} />
          )}
          <GlobalLayout.Content>
            <div className="divider" />
            <InfiniteScroll
              next={() => setSize((prev) => prev + 1)}
              hasMore={hasMorePhotos}
              dataLength={paginatedPhotos?.length}
              loader={<></>}
              scrollThreshold={0.45}
            >
              <div className="3xl:grid-cols-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-10 xl:grid-cols-5">
                {_.map(paginatedPhotos, (p, i) => {
                  if (p.slug) {
                    return (
                      <div key={i}>
                        <AdminAsset
                          asset={p}
                          onSuccess={() => onArchive(p.id)}
                          filetypeDownload={event.metadata.filetype_download}
                        />
                      </div>
                    );
                  }
                })}
                {isValidating && hasMorePhotos && (
                  <LoadingGrid
                    count={
                      _.min([_.first(data)?.meta?.per_page || 0, totalCount]) ||
                      0
                    }
                  />
                )}
              </div>
            </InfiniteScroll>
          </GlobalLayout.Content>
        </GlobalLayout>
      </PrivilegeProvider>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId } = context.query;

  // Fetch event config
  const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
  const token = context.req.cookies.hypno_token;

  let eventData: any = {};

  if (token && eventId) {
    await axios
      .get(eventUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then(async (res) => {
        if (res.status === 200) {
          eventData = await res.data;
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  if (_.isEmpty(eventData) && token && eventId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      ...eventData,
    },
  };
};

export default withAuth(EventPage, "protected");
