import axios from "axios";
import { useCallback, useState } from "react";
import _ from 'lodash';
import useUserStore from "@/store/userStore";

const isLikedByUser = (userId: number, likes: any) => {
    return _.find(likes, (v) => v.user_id == userId)?.liked || false;
}

export default function useAssetManager(asset: any, onUpdateSuccess?: () => void) {
    const { id, moderated, likes } = asset;

    const user = useUserStore.useUser();
    const token = useUserStore.useToken();
    const [isFavorited, setIsFavorited] = useState<boolean>(isLikedByUser(user.id, likes));
    const [isHidden, setIsHidden] = useState<boolean>(moderated);

    const photoActionUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/hypno/v1/photos`
    
    const archiveAsset = useCallback(async () => {
        const url = `${photoActionUrl}/${id}/archive`
        console.log(url)
        await axios.delete(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token.access_token,
            },
        }).then((res) => {
            console.log(res.data);
        }).catch((e) => {
            console.log(e);
        });
    }, [id]);

    const toggleHidden = useCallback(async () => {
        const url = `${photoActionUrl}/${id}/${isHidden ? 'unmoderate' : 'moderate'}`
        await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then((res) => {
            console.log(res.data);
            setIsHidden((prev) => !prev);
        }).catch((e) => {
            console.log(e);
        })
    }, [isHidden, id]);

    const toggleFavorited = useCallback(async () => {
        const url = `${photoActionUrl}/${id}/${isFavorited ? 'unlike' : 'like'}`
        await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token,
            },
        }).then((res) => {
            console.log(res.data);
            setIsFavorited((prev) => !prev);
        }).catch((e) => {
            console.log(e);
        })
    }, [isFavorited, id])
    
    return {
        isFavorited,
        isHidden,
        toggleHidden,
        toggleFavorited,
        archiveAsset,
    }
}
