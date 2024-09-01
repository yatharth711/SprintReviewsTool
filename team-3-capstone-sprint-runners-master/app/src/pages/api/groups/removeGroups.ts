// groups/removeGroups.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { courseID } = req.body;

  if (!courseID) {
    return res.status(400).json({ error: 'CourseID is required' });
  }

  try {
    // Delete all groups where the courseID matches the inputted courseID
    const deleteGroupsSql = 'DELETE FROM course_groups WHERE courseID = ?';
    await query(deleteGroupsSql, [courseID]);

    return res.status(200).json({ message: 'Groups removed successfully' });
  } catch (error) {
    console.error('Error removing groups:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
