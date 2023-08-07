import useUserStore from "@/store/userStore";
import axios from "axios";
import _ from 'lodash';
import { useEffect, useState } from "react";

type Organization = {
    id: number;
    name: string;
    metadata: {
        hypno?: boolean;
        hypno_pro?: {
            additional_users: number;
            api_access: boolean;
            base_users: number;
            cancel_at?: any;
            canon_connect: boolean;
            current_tier: string;
            custom_branding: boolean;
            custom_domain: boolean;
            custom_legal: boolean;
            data_capture: boolean;
            effects: boolean;
            filters: Array<string>;
            graphics: boolean;
            line_items: Array<any>;
            live_support: boolean;
            plan_item_id: any;
            plan_price_id: any;
            studio_services: boolean;
            subscription_id: any;
            unlimited_uploads: boolean;
            user_item_id: boolean;
        }
    };
}

/**
 * For dropdown usage
 * Fetch a list of organizations the user has access to and returns them along
 * with error, validation, and loading status.
 * @returns This code exports a custom hook named `useOrganizations` that returns an object with the
 * following properties:
 */
export default function useOrganizations() {
    const token = useUserStore.useToken();
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/dropdown_index`;

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchOrganizations = async () => {
            await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token?.access_token
                }
            }).then((res) => {
                setIsLoading(false);
                setOrganizations(res.data.organizations);
            }).catch((e) => {
                setIsLoading(false);
                setError('oops! error!');
            })
        }
        fetchOrganizations();
    }, []);

    return {
        organizations,
        error,
        isLoading
    }
}

