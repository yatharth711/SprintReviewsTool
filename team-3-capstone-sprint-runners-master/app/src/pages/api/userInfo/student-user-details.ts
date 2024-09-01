import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db'; // Import your actual data fetching function here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const result = await query(`
        SELECT u.firstName, u.lastName, u.email, s.studentID, s.phoneNumber, s.homeAddress, s.dateOfBirth
        FROM user u
        LEFT JOIN student s ON u.userID = s.userID
        WHERE u.userID = ?
      `, [userID]);

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result[0];
      return res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}