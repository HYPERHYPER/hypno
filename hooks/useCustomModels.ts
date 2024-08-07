import { axiosGetWithToken } from "@/lib/fetchWithToken";
import useUserStore from "@/store/userStore";
import useSWR from "swr";
import _ from 'lodash';
import { CustomModel } from "@/types/event";


export default function useCustomModels(orgId?: number) {
    const token = useUserStore.useToken();
    const orgUrl = orgId
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${String(orgId)}`
        : null;
    const orgKey = orgUrl ? [orgUrl, token.access_token] : null
    const { data: orgData, error: orgError, mutate } = useSWR(
        orgKey,
        ([url, token]) => axiosGetWithToken(url, token),
    );
    const organization = orgData?.organization;
    const customModels = organization?.metadata?.ai_generation?.custom_models || {}
    const successfulModels = _.filter(customModels, (m) => m.status === 'succeeded').sort((a,b) => a.name.localeCompare(b.name));

    // Update organization endpoint
    const updateOrganizationCustomModels = async (customModels: any) => {

        let payload = {
            organization: {
                ai_generation: {
                    custom_models: {
                        ...customModels,
                    },
                }
            },
        };

        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/organizations/${orgId}`;
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token.access_token,
                },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error(res.statusText);
            }

            mutate(orgKey);
        } catch (e) {
            console.log('error', e);
        }
    }

    // On model training started or completed
    const addModel = (newModel: CustomModel) => {
        let updatedModels = {
            ...customModels,
            [newModel.id]: newModel
        }

        updateOrganizationCustomModels(updatedModels);
    }

    // On model training failed
    const deleteModel = (modelId: number) => {
        let updatedModels = customModels;
        delete updatedModels[modelId]

        updateOrganizationCustomModels(customModels);
    }

    return {
        customModels,
        successfulModels,
        addModel,
        deleteModel,
    }
}

