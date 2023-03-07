import axios from "axios";

/**
 * It takes a URL and an optional token, and returns a promise that resolves to the data from the URL
 * @param {string} url - The URL to fetch
 * @param {string} [token] - The token that you want to use to authenticate the request.
 */
export const axiosGetWithToken = (
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

/**
 * It fetches a URL with a token
 * @param {string} [url] - The URL to fetch.
 * @param {string} [token] - The token that you get from the login response.
 * @returns A function that takes two parameters, url and token, and returns a promise that resolves to
 * a JSON object.
 */
export const fetchWithToken = async (
    url?: string,
    token?: string
) => {
    if (!url) return null;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
        },
    });
    return response.json(); // parses JSON response into native JavaScript objects
}

