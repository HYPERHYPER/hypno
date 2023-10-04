import WebDisplayGallery from "@/components/WebDisplayGallery/Gallery";
import { axiosGetWithToken } from "@/lib/fetchWithToken";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from 'swr';
import _ from 'lodash';
import axios from "axios";
import { EventConfig } from "@/types/event";

interface ResponseData {
    event: EventConfig;
}

export default function WebDisplayGalleryPage(props: ResponseData) {
    const { query } = useRouter();
    const eventId = query.eventId;
    const displayNum = Number(query.display_num) || 0;
    const fetchInterval = Number(query.fetch_interval) || 0;
    const transitionEffect = query.transition_effect;
    const transitionDuration = Number(query.transition_duration) || 1.5;
    const assetType = String(query.asset_type) || 'gif';

    const assetUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/events/${String(eventId)}/photos?per_page=${displayNum}`
    const token = process.env.NEXT_PUBLIC_AUTH_TOKEN;
    const { data, isValidating, error } = useSWR([assetUrl, token],
        ([url, token]) => axiosGetWithToken(url, token),
        { 
            refreshInterval: fetchInterval
        }
    )
    const assets = data?.photos;

    const [displayAssets, setDisplayAssets] = useState<any>([])
    useEffect(() => {
        if (assets) {
            setDisplayAssets(assets)
        }
    }, [assets])
    
    return (
        <>
            <Head>
                <title>{'display gallery | hypno™'}</title>
                <meta name="description" content="Taken with HYPNO: The animated, social photo booth" />
            </Head>
            {assets && <WebDisplayGallery 
                assets={displayAssets}
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