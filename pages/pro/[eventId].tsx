import { useRouter } from 'next/router';
import Image from 'next/image';
import axios from 'axios';
import type { GetServerSideProps } from 'next';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useState, useRef } from 'react';
import ArrowRight from '../../public/pop/arrow-right.svg';
import ArrowLeft from '../../public/pop/arrow-left.svg';

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
};

interface ResponseData {
  status: number;
  message: string;
  count: number;
  returned: number;
  pages: number;
  photos: ImageData[];
}

const SubGallery = (props: ResponseData) => {
  const { photos } = props;
  const [queue, setQueue] = useState<number[]>([]);
  let emailRef = useRef<HTMLInputElement>(null);
  let sendModalInputRef = useRef<HTMLInputElement>(null);
  //   const router = useRouter()
  //   const { eventId, subsetId } = router.query
  //   return <p>event id: { eventId } , subset id: { subsetId }</p>
  const queueHandler = (id: number) => {
    const copy = [...queue];
    console.log('before', copy);
    console.log(copy.includes(id));
    if (copy.includes(id)) {
      //remove id
      const idx = copy.indexOf(id);
      copy.splice(idx, 1);
    } else {
      copy.push(id);
    }
    setQueue(copy);
    console.log('after', copy);
  };

  const multiSend = async (photoIds: number[], email: string) => {
    const ids = JSON.stringify(photoIds);
    // const url = `https://pro.hypno.com/api/v1/photos/multi_deliver?photo_ids=${ids}&email=${email}`;
    const url = `https://localhost:4000/api/v1/photos/multi_deliver?photo_ids=${ids}&email=${email}`;
    const token = '';
    let resp = await axios.post(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    let data = await resp.data;
    console.log('data', data);
  };
  return (
    <>
      <input type='checkbox' id='info-modal' className='modal-toggle' />
      <label htmlFor='info-modal' className='modal cursor-pointer'>
        <label className='modal-box relative' htmlFor=''>
          <h3 className='text-lg font-bold'>No Photos Selected!</h3>
          <p className='py-4'>
            Select the photos you would like for us to send HD versions to your
            inbox!
          </p>
        </label>
      </label>
      <input
        ref={sendModalInputRef}
        type='checkbox'
        id='send-modal'
        className='modal-toggle'
      />
      <label htmlFor='send-modal' className='modal cursor-pointer'>
        <label className='modal-box relative' htmlFor=''>
          <h3 className='text-lg font-bold'>Where should we send these to ?</h3>
          <div className='form-control mt-3'>
            <label className='input-group'>
              <span>Email</span>
              <input
                type='text'
                placeholder='info@site.com'
                className='input input-bordered'
                ref={emailRef}
              />
            </label>
          </div>
          <div className='modal-action'>
            <label
              className='btn'
              onClick={() => multiSend(queue, emailRef.current!.value)}
            >
              <ArrowRight />
            </label>
          </div>
        </label>
      </label>
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry gutter='15px' className='p-5'>
          {/* <Masonry columnsCount={3} gutter="10px"> */}
          {photos.length ? (
            photos.map((p) => (
              <div
                key={p.id}
                className='w-full h-auto block cursor-pointer indicator'
                onClick={() => queueHandler(p.id)}
              >
                {queue.includes(p.id) ? (
                  <span className='indicator-item badge badge-primary' />
                ) : null}
                <img src={p.jpeg_url} alt={p.event_name + p.id} />
              </div>
            ))
          ) : (
            <p>no photos have been added</p>
          )}
        </Masonry>
      </ResponsiveMasonry>
      <label
        className='btn btn-lg btn-circle fixed z-90 bottom-10 right-8 w-50 h-50 justify-center items-center hover:bg-green-700 hover:drop-shadow-2xl hover:animate-pulse duration-300'
        htmlFor={queue.length ? 'send-modal' : 'info-modal'}
      >
        {queue.length ? queue.length : null}
        <ArrowRight />
      </label>
      {/* <button className='btn btn-lg btn-circle btn-outline fixed z-90 bottom-10 left-8 w-50 h-50 justify-center items-center hover:bg-green-700 hover:drop-shadow-2xl hover:animate-pulse duration-300'>
        <ArrowLeft />
      </button> */}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eventId, subset } = context.query;
    // const url = `http://localhost:4000/api/v1/events/${eventId}/search_metadata?search_key=hypno_pro&search_value=${subsetId}`;
//   const url = `https://pro.hypno.com/api/v1/events/${eventId}/search_metadata?search_key=hypno_pro&search_value=${subsetId}`;
//   const url = `https://pro.hypno.com/api/v1/events/${eventId}/${subsetId}/photos.json`;
  console.log(eventId, subset)
  const url = `http://localhost:4000/api/v1/events/${eventId}/${subset}/photos.json`;
  const token = '';
  let resp = await axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
  });
  let data = await resp.data;
  console.log('message', data);
  console.log('message', data.message);
  // console.log('query:', eventId, subsetId)
  // console.log('params:', context.params)
  // console.log('req:', context.req)
  // console.log('cookies:', context.req.cookies)
  // console.log('res:', context.res)

  return {
    props: data,
  };
};

export default SubGallery;
