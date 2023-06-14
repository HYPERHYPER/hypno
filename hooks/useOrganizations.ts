import { fetchWithToken } from "@/lib/fetchWithToken";
import useUserStore from "@/store/userStore";
import _ from 'lodash';
import useSWRInfinite from 'swr/infinite';

type Organization = {
    id: number;
    name: string;
    metadata: {
        hypno?: boolean;
        hypno_pro?: {
            plan?: string;
        }
    };
}

interface OrganizationsResponse {
    organizations?: Organization[];
    meta?: {
        current_page?: number;
        next_page?: number;
        per_page?: number;
        prev_page?: number;
        total_count?: number;
        total_pages?: number;
    }
}

export default function useOrganizations(per_page: number) {
    const token = useUserStore.useToken();
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (previousPageData && pageIndex == previousPageData.pages) return null; // reached the end
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations?per_page=${per_page}`;
        if (pageIndex === 0) return [url, token.access_token];
        const pageIdx = previousPageData.meta.next_page;
        return [`${url}&page=${pageIdx}`, token.access_token];
    }

    const { data, size, setSize, error, isValidating, isLoading } = useSWRInfinite(getKey,
        ([url, token]) => fetchWithToken(url, token), {
        fallbackData: [{ organizations: [] }],
    });

    const organizations: Organization[] = _.map(data, (v) => v.organizations).flat();
    const meta = _.last(data).meta;
    const loadMore = () => setSize((prev) => prev + 1);

    return {
        organizations,
        meta,
        loadMore,
        error,
        isValidating,
        isLoading,
    }
}

