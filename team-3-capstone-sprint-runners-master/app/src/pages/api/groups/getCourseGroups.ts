// pages/api/getCourseGroups.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getCourseGroups } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { courseID } = req.query;

    console.log('Fetching students in course:', courseID);

    try {
      const groups = await getCourseGroups(Number(courseID));
      res.status(200).json(groups);
    } catch (error) {
      const err = error as Error;
      console.error('Failed to fetch students:', err.message);
      res.status(500).json({ error: `Failed to fetch students`, details: err.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
