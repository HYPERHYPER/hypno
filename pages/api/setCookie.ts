import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Value for the cookie is missing.' });
  }

  // Set the HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `hypno_token=${value}; Path=/; HttpOnly`
  );

  // Send a response indicating that the cookie has been set
  res.status(200).json({ message: 'Cookie set successfully' });
}