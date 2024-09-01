// pages/api/auth/instructor-login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateInstructor, authenticateAdmin } from '../../../db';
import { login } from '../../../lib';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    try {
      const isAuthenticated = await authenticateInstructor(email, password);
      const isAdmin = await authenticateAdmin(email, password);
      if (isAdmin) {
        // Create session for this admin user before authenticating
        await login({ email, password, role: 'admin' }, res);
        res.status(200).json({ message: 'Authenticated' });
      } else if (isAuthenticated) {
        // Create session for this user before authenticating
        await login({ email, password, role: 'instructor' }, res);
        res.status(200).json({ message: 'Authenticated' });
      } else {
        res.status(401).json({ message: 'Invalid email or password' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
