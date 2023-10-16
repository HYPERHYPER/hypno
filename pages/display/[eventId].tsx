import WebDisplayGallery from "@/components/WebDisplayGallery/Gallery";
import { axiosGetWithToken } from "@/lib/fetchWithToken";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import useSWR from 'swr';
import _ from 'lodash';
import axios from "axios";
import { EventConfig } from "@/types/event";

interface ResponseData {
    event: EventConfig;
}

function arraysAreEqual(arr1: any, arr2: any) {
    if (arr1.length !== arr2.length) {
        return false;
    }

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    return true;
}

export default function WebDisplayGalleryPage(props: ResponseData) {
    const { query } = useRouter();
    const eventId = query.eventId;
    const displayNum = Number(query.display_num) || 5;
    const displayRange = Number(query.display_range) || displayNum;
    const displayTimer = Number(query.display_timer) || 0;
    const fetchInterval = Number(query.fetch_interval) || 0;
    const transitionEffect = query.transition_effect;
    const transitionDuration = Number(query.transition_duration) || 1.5;
    const assetType = String(query.asset_type) || 'image';

    const assetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}/photos?per_page=${displayRange}`
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const { data, isValidating, error } = useSWR([assetUrl, token],
        ([url, token]) => axiosGetWithToken(url, token),
        {
            ...(fetchInterval != 0 && { refreshInterval: fetchInterval })
        }
    )
    const assets = data?.photos || [];

    const [displayAssets, setDisplayAssets] = useState<any>([])

    // Refreshes display when new assets fetched (on fetch interval)
    useEffect(() => {
        if (assets && assets.length > 0 && !arraysAreEqual(displayAssets, assets)) {
            setDisplayAssets(assets);
        }
    }, [assets])

    const handleNextAsset = () => {
        if (displayAssets.length > 0) {
            const updatedAssetsArr = [...displayAssets]; // Clone array
            const lastAsset = updatedAssetsArr.pop(); // Remove the last item
            updatedAssetsArr.unshift(lastAsset); // Add to front of cloned array
            setDisplayAssets(updatedAssetsArr);
        }
    };

    // Cycle through recent assets (# of recents determined by display range)
    useEffect(() => {
        if (displayTimer !== 0) {
            const cycleAssetsInterval = setInterval(handleNextAsset, displayTimer)
            return () => {
                clearInterval(cycleAssetsInterval)
            }
        }
    }, [displayTimer, displayAssets])

    // Display a subset of photos determined by startDisplayIdx
    const currentDisplayAssets = _.slice(displayAssets, 0, displayNum);

    return (
        <>
            <Head>
                <title>{'display gallery | hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>
            {!_.isEmpty(displayAssets) && <WebDisplayGallery
                assets={currentDisplayAssets}
                displayCount={displayNum}
                assetType={assetType}
                transitionDuration={transitionDuration}
            />}
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { eventId } = context.query;

    // let token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    // const eventUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}`;
    // let eventData: any = {};

    // try {
    //     axios.get(eventUrl, {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: 'Bearer ' + token,
    //         }
    //     }).then((res) => {
    //         if (res.status == 200) {
    //             eventData = res.data
    //         }
    //     })
    // } catch (e) {
    //     console.log(e);
    // }

    // if (_.isEmpty(eventData)) {
    //     return {
    //         notFound: true,
    //     }
    // }

    return {
        props: {
            // ...eventData,
        }
    }
}