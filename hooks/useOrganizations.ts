import useUserStore from "@/store/userStore";
import { Organization } from "@/types/organizations";
import axios from "axios";
import _ from 'lodash';
import { useEffect, useState } from "react";

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

