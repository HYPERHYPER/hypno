import { getFilename, getS3Filename } from '@/helpers/text';
import axios from 'axios';
import { useState, useRef, SyntheticEvent, useEffect } from 'react';
import { ThreeDots } from 'react-loader-spinner';
import Plus from 'public/pop/plus.svg';
import Minus from 'public/pop/minus.svg';
import { isValidAspectRatio } from '@/helpers/image';
import useUserStore from '@/store/userStore';

type AspectRatio = `${number}:${number}`;

interface UploaderProps {
  inputId: string;
  onInputChange?: (value: string) => void;
  value?: string;
  disabled?: boolean;
  validateAspectRatio?: AspectRatio;
  uploadCategory: 'watermark' | 'logo' | 'background' | 'filter' | 'user' | 'ai';
}

export default function FileInput(props: UploaderProps) {
  const user = useUserStore.useUser();
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
    console.log('setup input', files[0].name.split('.')[0])
    if (files[0].type == 'application/zip') {
      createZipFile(files[0]);
    } else {
      createImage(files[0]);
    }
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

        // Create a new image element to check the aspect ratio
        const img = new Image();
        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (props.validateAspectRatio) {
            const desiredAspectRatio = props.validateAspectRatio;

            if (!isValidAspectRatio(width, height, desiredAspectRatio)) {
              setUploadStatus('error');
              setNewFilename('error');
              alert("Invalid aspect ratio. Please choose an image with a different aspect ratio.");
              resetInput(null);
              return;
            }
          };

          setFile(e.target?.result as ArrayBuffer);
          setContentType((e.target?.result as string).split(':')[1].split(';')[0]);
          setUploadStatus('ready');
        }
        img.src = e.target.result as string;
      };
    }
    reader.readAsDataURL(file);
  };

  const createZipFile = (file: File) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        // Create a new Uint8Array from the ArrayBuffer
        const arrayBuffer = e.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
  
        // Set the file data and content type
        setFile(uint8Array.buffer);
        setContentType('application/zip');
        setUploadStatus('ready');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadToS3 = async () => {
    setUploadStatus('uploading')
    const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
    const resp = await axios.get(url, {
      params: { 
        fileName: getS3Filename(user.id, props.uploadCategory, newFilename, props.validateAspectRatio), 
        contentType 
      },
    });

    let binary = Buffer.from(contentType == 'application/zip' ? (file as string) : (file as string).split(',')[1], 'base64');
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
    e?.preventDefault();
    setAssetLocation('');
    props.onInputChange && props.onInputChange('');
    setFile('');
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
      <div className="dropdown dropdown-top dropdown-hover">
        <label tabIndex={0} className='text-lg sm:text-4xl text-primary truncate'>{uploadStatus == 'error' ? <span className='text-red-500'>error</span> : getFilename(props.value || '')}</label>
        <div tabIndex={0} className='left-1/2 mb-5 dropdown-content bg-white/10 backdrop-blur-[30px] rounded-box p-3 sm:p-4'>
            <img className='max-h-[200px] w-auto' src={props.value || ''} />
        </div>
      </div>
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


