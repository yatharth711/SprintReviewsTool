import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userID } = req.query;

  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT sn.*, s.studentID, s.userID
         FROM student_notifications sn join student s on sn.studentID=s.studentID
         WHERE userID = ?`,
        [userID]
      );

      if (result.length === 0) {
        return res.status(404).json({ message: 'Student not found' });
      }

      res.status(200).json(result[0]);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      res.status(500).json({ message: 'Error fetching notification preferences', error });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
