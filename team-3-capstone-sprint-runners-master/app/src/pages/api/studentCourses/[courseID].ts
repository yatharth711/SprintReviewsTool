// pages/api/courses/[courseID].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { courseID } = req.query;

  if (typeof courseID !== 'string') {
    res.status(400).json({ error: 'Invalid courseID' });
    return;
  }

  try {
    const course = await getCourse(courseID);

    if (course) {
      res.status(200).json(course);
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function getCourse(courseID: string) {
  const sql = `
    SELECT c.courseID, courseName
    FROM course c JOIN enrollment e on c.courseID=e.courseID
    WHERE courseID = ? AND isArchived = 0
  `;
  try {
    const rows = await query(sql, [courseID]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getCourse:', error);
    throw error;
  }
}