//getcourses4assign.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getCourses} from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const courses = await getCourses();
      res.status(200).json(courses);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred while fetching the courses.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
}
