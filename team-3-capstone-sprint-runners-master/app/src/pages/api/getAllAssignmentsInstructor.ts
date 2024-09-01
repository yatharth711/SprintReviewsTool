import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllAssignmentsInstructor } from '../../db';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userID } = req.query;
    try {
      const assignments = await getAllAssignmentsInstructor(Number(userID));
      res.status(200).json({ assignments }); // Change 'courses' to 'assignments'
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch assignments' }); // Change 'courses' to 'assignments'
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}


