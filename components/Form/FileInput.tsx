import { getFilename } from '@/helpers/text';
import axios from 'axios';
import { useState, useRef, SyntheticEvent, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import Plus from 'public/pop/plus.svg';
import Minus from 'public/pop/minus.svg';

interface UploaderProps {
  orgId: string;
  inputId?: string;
  onInputChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
}

export default function FileInput(props: UploaderProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<ArrayBuffer | string>('');
  const [contentType, setContentType] = useState('');
  const [newFilename, setNewFilename] = useState('');
  const [assetLocation, setAssetLocation] = useState('');

  const [uploadStatus, setUploadStatus] = useState<'ready' | 'uploading' | 'completed' | 'error'>();

  const onFileChange = async (e: SyntheticEvent) => {
    let files = (e.target as HTMLInputElement).files
    if (!files?.length) return;
    setUploadStatus(undefined);
    setNewFilename(files[0].name.split('.')[0]);
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
        setUploadStatus('ready');
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadToS3 = async () => {
    setUploadStatus('uploading')
    const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
    const resp = await axios.get(url, {
      params: { fileName: props.orgId + '/' + newFilename, contentType },
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

  const resetInput = (e: any) => {
    e.preventDefault();
    setAssetLocation('');
    props.onInputChange && props.onInputChange('');
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  }

  useEffect(() => {
    if (uploadStatus == 'ready') {
      uploadToS3();
    }
  }, [uploadStatus])

  return (
    <div className='flex gap-3 items-center'>
      <span className='text-lg sm:text-4xl text-primary truncate'>{uploadStatus == 'error' ? <span className='text-red-500'>error</span> : getFilename(props.value || '')}</span>
      <input
        type='file'
        id={props.inputId}
        hidden
        onChange={onFileChange}
        disabled={props.disabled}
      />
      {props.disabled ? (
        <div className="cursor-not-allowed h-10 w-10 rounded-full bg-white/10 text-black flex items-center justify-center">
          <Plus />
        </div>
      ) :
        uploadStatus == 'uploading' ? (
          <div className="cursor-pointer h-10 w-10 rounded-full bg-white/20 text-black flex items-center justify-center">
            <ThreeDots
              height="20"
              width="20"
              radius="4"
              color="black"
              ariaLabel="three-dots-loading"
              visible={true}
            />
          </div>
        ) : (
          props.value ?
            <label onClick={resetInput} className="cursor-pointer h-10 w-10 rounded-full bg-white/20 text-black flex items-center justify-center"><Minus /></label>
            :
            <label htmlFor={props.inputId} className="cursor-pointer h-10 w-10 rounded-full bg-white/20 text-black flex items-center justify-center"><Plus /></label>
        )}
    </div>
  )
}


