import type { NextApiRequest, NextApiResponse } from 'next';
import { getAssignmentsWithSubmissions } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const assignments = await getAssignmentsWithSubmissions();
      res.status(200).json(assignments);
    } catch (error: any) {
      console.error('Error fetching assignments with submissions:', error);
      res.status(500).json({ 
        message: 'An error occurred while fetching assignments with submissions',
        error: error.message || 'Unknown error'
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}