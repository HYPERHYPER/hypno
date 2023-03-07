const fetchHuggingFace = async ({url, data}: {url: string, data: any}) => {
    const res = await fetch("/api/hugging", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url,
            data
        }),
    });
    await res.json().then((val) => {
        return val;
    });
}

