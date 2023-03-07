import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const response = await fetch(req.body.url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({data: req.body.data}),
    });
  
    if (response.status !== 200) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
    
    const data = await response.json();
    res.statusCode = 201;
    res.end(JSON.stringify(data));
  }