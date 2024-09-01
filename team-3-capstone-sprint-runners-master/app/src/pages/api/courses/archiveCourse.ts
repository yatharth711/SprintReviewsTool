// /pages/api/archiveCourse.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { courseID } = req.body;

    try {
      // Retrieve the current isArchived status of the course
      const selectSql = 'SELECT isArchived FROM course WHERE courseID = ?';
      const rows = await query(selectSql, [courseID]);

      if (rows.length === 0) {
        res.status(404).json({ error: 'Course not found' });
        return;
      }

      const currentStatus = rows[0].isArchived;
      const newStatus = !currentStatus;

      // Update the isArchived status to the opposite value
      const updateSql = 'UPDATE course SET isArchived = ? WHERE courseID = ?';
      await query(updateSql, [newStatus, courseID]);

      res.status(200).json({ message: 'Course archived status toggled successfully' });
    } catch (error) {
      console.error('Error archiving course:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
