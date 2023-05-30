import { fetchWithToken } from "@/lib/fetchWithToken";
import useUserStore from "@/store/userStore";
import axios from "axios";
import { parseCookies } from "nookies";
import { useEffect } from "react";
import _ from 'lodash';
import useSWRInfinite from 'swr/infinite';

type Filter = {
    id: number;
    lookup: string;
    name: string;
    watermark_blend_ci_filter_name?: string;
}

interface FiltersResponse {
    filters?: Filter[];
    meta?: {
        current_page?: number;
        next_page?: number;
        per_page?: number;
        prev_page?: number;
        total_count?: number;
        total_pages?: number;
    }
}

export default function useFilters(per_page: number) {
    const token = useUserStore.useToken();
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/filters?per_page=${per_page}`;
        if (pageIndex === 0) return [url, token.access_token];
        const pageIdx = previousPageData.meta.next_page;
        return [`${url}&page=${pageIdx}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ filters: [] }],
    });

    const filters: Filter[] = _.map(data, (v) => v.filters).flat();
    const meta = _.last(data).meta;
    const loadMore = () => setSize((prev) => prev + 1);

    return {
        filters,
        meta,
        loadMore
    }
}

