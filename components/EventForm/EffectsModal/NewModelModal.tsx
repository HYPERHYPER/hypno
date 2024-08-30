import { useFormContext } from "react-hook-form";
import FileInput from "../../Form/FileInput"
import FormControl from "../../Form/FormControl"
import Modal from "../../Modal"
import { useState } from "react";
import axios from "axios";
import { getS3Filename } from "@/helpers/text";
import useUserStore from "@/store/userStore";
import Timer from "../../Timer";
import LogDisplay from "./LogDisplay";
import { CustomModel } from "@/types/event";

const sleep = (ms: number | undefined) => new Promise((r) => setTimeout(r, ms));

export default function NewModelModal({
    onTrainingUpdate,
    onTrainingFailed
}: {
    onTrainingUpdate: (model: CustomModel) => void;
    onTrainingFailed: (modelId: number) => void;
}) {
    const { setValue } = useFormContext();

    const [modelName, setModelName] = useState<string>('');
    const [trainingData, setTrainingData] = useState<string>(); // zip file upload

    const [trainingStatus, setTrainingStatus] = useState<string>();
    const [trainedModel, setTrainedModel] = useState<CustomModel>();

    const [currentPrediction, setCurrentPrediction] = useState<any>();

    const trainModel = async (e: any) => {
        e.preventDefault();
        if (!trainingData || !modelName) return;

        setTrainingStatus('starting')
        const response = await fetch("/api/train", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input_images: trainingData,
            }),
        });
        let prediction = await response.json();
        if (response.status !== 201) {
            console.log('err:', prediction.detail);
            setTrainingStatus('failed')
            return;
        }
        console.log('pred', prediction);
        setCurrentPrediction(prediction);
        let model_id = prediction.id;

        const initModel = {
            id: model_id,
            name: modelName,
            status: prediction.status,
        }
        onTrainingUpdate(initModel)

        while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed"
        ) {
            await sleep(1000);
            const response = await fetch("/api/predictions/" + prediction.id);
            prediction = await response.json();
            setCurrentPrediction(prediction);

            if (response.status !== 200) {
                console.log('Error', prediction.detail);
                setTrainingStatus('failed');
                onTrainingFailed(model_id);
                return;
            }

            // console.log({ prediction })
            setTrainingStatus(prediction.status)

            if (prediction.status == 'succeeded') {
                try {
                    const s3Url = await saveModelUrl(prediction);
                    const updatedModel = {
                        ...initModel,
                        status: prediction.status,
                        lora_url: s3Url
                    }
                    setTrainingStatus('finished');
                    setTrainedModel(updatedModel);
                    onTrainingUpdate(updatedModel);
                } catch (e) {
                    // Model upload failed
                    setTrainingStatus('failed');
                    onTrainingFailed(model_id);
                }
            }
        }
    };

    const user = useUserStore.useUser();

    let modelTraining = { name: 'test' }
    const saveModelUrl = async (prediction: any) => {
        // Get S3 upload url
        console.log('uploading to s3');
        setTrainingStatus('saving')
        const url = process.env.NEXT_PUBLIC_AWS_ENDPOINT as string;
        const contentType = 'application/x-tar';
        const resp = await axios.get(url, {
            params: {
                fileName: getS3Filename(user.id, 'ai', `${modelName || modelTraining?.name}-trained-model`),
                contentType
            },
        });
        console.log('get s3 upload url', resp)

        const replicateModelUrl = prediction.output;
        console.log('replicateModelUrl', replicateModelUrl)
        // Fetching the tar file
        let blob;
        try {
            const fileData = await fetch(replicateModelUrl);
            blob = await fileData.blob();
            console.log('Blob created successfully');
        } catch (error) {
            console.error('Error fetching or creating blob:', error);
        }

        try {
            // Upload file to S3 upload url
            console.log('Uploading to: ', resp.data.uploadURL);
            const result = await fetch(resp.data.uploadURL, {
                method: 'PUT',
                headers: {
                    'Content-Type': contentType,
                },
                body: blob,
            });

            console.log('upload to s3 results', result)

            // Check if upload was successful
            if (!result.ok) {
                throw new Error('Model S3 upload failed')
            }

            const s3Url = result.url.split('?')[0];
            console.log('Upload successful', s3Url);
            return s3Url;
        } catch (e) {
            console.log(e);
        }
    }

    const handleFinishedTraining = (e: any) => {
        e.preventDefault();
        // Set new model to current model applied
        setValue('ai_generation.custom.current', trainedModel, { shouldDirty: true });

        // Reset inputs
        setModelName('');
        setTrainingData('');
        setTrainingStatus(undefined);

        // Close modal
        const modalCheckbox = document.getElementById("new-model-modal");
        if (modalCheckbox) {
            modalCheckbox.click(); // Trigger click on the checkbox to close the modal
        }
    }

    let logs = currentPrediction?.logs || '';

    return (
        <Modal
            title='new model'
            id='new-model-modal'
            actionBtn={{
                status: 'ready',
                onClick: (e) => handleFinishedTraining(e),
                text: 'apply model',
                hidden: trainingStatus != 'finished'
            }}
        >
            <div className="list pro">
                <FormControl label="model name">
                    <input className="input pro" value={modelName} onChange={(e) => setModelName(e.target.value)} />
                </FormControl>
                <FormControl label="training data" altLabel="upload a zip file of training images to fine tune your model">
                    <FileInput uploadCategory="ai" inputId='trainingPhotosInput' onInputChange={(val) => setTrainingData(val)} value={trainingData} />
                </FormControl>
                <FormControl label='ready?'>
                    {trainingStatus ?
                        <div className="text-primary sm:text-3xl flex items-center gap-2">{trainingStatus} {trainingStatus !== 'finished' && <span className="w-[50px] sm:min-w-[90px]"><Timer /></span>}</div>
                        : <button className="sm:text-3xl text-primary" onClick={trainModel}>start ↓</button>
                    }
                </FormControl>
                {trainingStatus &&
                    <>
                        <div className='item' style={{ borderBottom: 0 }}>
                            <div className="text-white/40">
                                <span>keep window open until finished </span>
                            </div>
                        </div>
                        <div className="text-white/40 sm:text-3xl">
                            <span>this might take a minute.......................</span>
                            <LogDisplay logs={logs} />
                            {trainingStatus == 'finished' && <span className="text-white">training complete</span>}
                        </div>
                    </>
                }
            </div>
        </Modal>
    )

}