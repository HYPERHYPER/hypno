import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Delete the HTTP-only cookie by setting its expiration to a past date
  res.setHeader(
    'Set-Cookie',
    'hypno_token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  );

  // Send a response indicating that the cookie has been deleted
  res.status(200).json({ message: 'Cookie deleted successfully' });
}