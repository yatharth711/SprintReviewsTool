import { NextApiRequest, NextApiResponse } from 'next';
import { getSession, updateSession } from '../../../lib';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req);
    await updateSession(req, res);
    res.status(200).json(session);
  } catch (error: any) {
    console.log(error.message);
    if (error.message === '"exp" claim timestamp check failed') {
      res.status(401).json({ message: 'Session has expired' });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default handler;