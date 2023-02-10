import axios from "axios";

/**
 * It takes a URL and an optional token, and returns a promise that resolves to the data from the URL
 * @param {string} url - The URL to fetch
 * @param {string} [token] - The token that you want to use to authenticate the request.
 */
export const fetchWithToken = (
    url: string,
    token?: string
) => (
    axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    }).then((res) => res.data)
)

