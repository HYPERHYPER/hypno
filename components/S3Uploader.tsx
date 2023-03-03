import axios from 'axios';
import { useState, useRef, SyntheticEvent } from 'react';
import { ThreeDots } from 'react-loader-spinner';

interface UploaderProps {
  eventName: string;
  label: string;
  inputId?: string;
  onInputChange?: (value: string) => void;
  value?: string;
}

export default function S3Uploader(props: UploaderProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<ArrayBuffer | string>('');
  const [contentType, setContentType] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [assetLocation, setAssetLocation] = useState('');

  const [uploadStatus, setUploadStatus] = useState<'uploading' | 'completed' | 'error'>();

  const onFileChange = (e: SyntheticEvent) => {
    let files = (e.target as HTMLInputElement).files
    if (!files?.length) return;
    setUploadStatus(undefined);
    createImage(files[0]);
  };

  const createImage = (file: File) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      // console.log("length: ", e.target.result.includes("data:image/jpeg"));
      // if (!e.target.result.includes("data:image/jpeg")) {
      //   return alert("Wrong file type - JPG only.");
      // }
      // if (e.target.result.length > MAX_IMAGE_SIZE) {
      //   return alert("Image is loo large.");
      // }
      if (e.target?.result) {
        setFile(e.target.result);
        setContentType((e.target.result as string).split(':')[1].split(';')[0]);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadToS3 = async (e: any) => {
    e.preventDefault();
    setUploadStatus('uploading')
    const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
    const resp = await axios.get(url, {
      params: { fileName: props.eventName + '/' + newFilename, contentType },
    });

    let binary = Buffer.from((file as string).split(',')[1], 'base64');
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
      props.onInputChange && props.onInputChange(result.url.split('?')[0]);
      if (fileRef.current) {
        fileRef.current.value = result.url.split('?')[0];
      }
      setUploadStatus('completed')
    } else {
      setUploadStatus('error')
    }
  };

  const resetInput = () => {
    setAssetLocation('');
    props.onInputChange && props.onInputChange('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  }

  return (
    <>
      <div className='form-control w-full'>
        <label className='label'>
          <label className='label-text'>{props.label}</label>
          <label className='label-text-alt text-white/30 flex flex-row gap-3'>
            <label htmlFor={`${props.inputId}-upload-modal`} className='cursor-pointer hover:text-white transition'>Upload</label>
            <label className='cursor-pointer hover:text-red-400 transition' onClick={resetInput}>Reset</label>
          </label>
        </label>
        <input
          type='text'
          placeholder='Asset URL'
          className='input input-bordered w-full'
          ref={fileRef}
          disabled
          id={props.inputId}
          value={props.value}
        />
      </div>

      <input type='checkbox' id={`${props.inputId}-upload-modal`} className='modal-toggle' />
      <label htmlFor={`${props.inputId}-upload-modal`} className='modal cursor-pointer'>
        <label className='modal-box relative text-black' htmlFor={`${props.inputId}-upload-modal`}>
          <label
            htmlFor={`${props.inputId}-upload-modal`}
            className='btn btn-sm btn-square rounded-full absolute right-3 top-3'
          >
            ✕
          </label>
          <h3 className='text-lg font-medium'>Select media for upload</h3>
          <input
            type='file'
            className='file-input input-bordered w-full mt-3'
            onChange={onFileChange}
          />

          <div className='modal-action'>
            <button className={`btn btn-block rounded-full ${uploadStatus == 'completed' ? 'btn-success' : ''}`} disabled={uploadStatus == 'uploading'} onClick={uploadToS3}>
              {uploadStatus == 'uploading' ? (
                <ThreeDots
                  height="20"
                  width="50"
                  radius="4"
                  color="#3D4451"
                  ariaLabel="three-dots-loading"
                  visible={true}
                />
              ) : 
                uploadStatus == 'completed' ? 'Success!' : 'Upload'
              }
            </button>
          </div>
        </label>
      </label>
    </>
  );
}
