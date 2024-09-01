// /pages/api/getCourses.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllCourses } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { isArchived } = req.query;
    const courses = await getAllCourses(isArchived === 'true'); //this doesn't seem right
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error in getCourses API:', error); // Log the error
    res.status(500).json({ error: 'Internal Server Error' });
  }
}