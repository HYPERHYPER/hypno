import axios from 'axios';
import { useState, useRef } from 'react';

interface UploaderProps {
  eventName: string;
}

export default function S3Uploader(props: UploaderProps) {
  const fileRef = useRef();
  const [file, setFile] = useState('');
  const [contentType, setContentType] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [assetLocation, setAssetLocation] = useState('');

  const onFileChange = (e) => {
    let files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;
    createImage(files[0]);
  };

  const createImage = (file) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      // console.log("length: ", e.target.result.includes("data:image/jpeg"));
      // if (!e.target.result.includes("data:image/jpeg")) {
      //   return alert("Wrong file type - JPG only.");
      // }
      // if (e.target.result.length > MAX_IMAGE_SIZE) {
      //   return alert("Image is loo large.");
      // }
      setFile(e.target.result);
      setContentType(e.target.result.split(':')[1].split(';')[0]);
    };
    reader.readAsDataURL(file);
  };

  const uploadToS3 = async (e) => {
    const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
    const resp = await axios.get(url, {
      params: { fileName: props.eventName + '/' + newFilename, contentType },
    });

    let binary = Buffer.from(file.split(',')[1], 'base64');
    let blob = new Blob([binary as BlobPart], {
      type: contentType,
    });

    console.log('Uploading to: ', resp.data.uploadURL);
    const result = await fetch(resp.data.uploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: blob,
    });

    if (result.status == 200) {
      setAssetLocation(result.url.split('?')[0]);
      fileRef.current.value = result.url.split('?')[0];
    }
  };

  return (
    <>
      <div className='form-control w-full max-w-xs'>
        <label className='label text-right justify-end'>
          <label
            htmlFor='upload-modal'
            className='label-text-alt cursor-pointer'
          >
            Upload
          </label>
        </label>
        <input
          type='text'
          placeholder='asset url'
          className='input input-bordered w-full max-w-xs'
          ref={fileRef}
        />
      </div>

      <input type='checkbox' id='upload-modal' className='modal-toggle' />
      <label htmlFor='upload-modal' className='modal cursor-pointer'>
        <label className='modal-box relative' htmlFor='upload-modal'>
          <label
            htmlFor='upload-modal'
            className='btn btn-sm btn-circle absolute right-2 top-2'
          >
            ✕
          </label>
          <h3 className='text-lg font-bold'>select media for upload</h3>
          <input
            type='file'
            className='file-input w-full max-w-xs mt-3'
            onChange={onFileChange}
          />
          <div className='modal-action'>
            <button className='btn' onClick={uploadToS3}>
              upload
            </button>
          </div>
        </label>
      </label>
    </>
  );
}
