// pages/api/selectStudentsForAssignment.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { selectStudentsForAssignment } from '../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { assignmentID, studentIDs, uniqueDeadline } = req.body;

    try {
      await selectStudentsForAssignment(assignmentID, studentIDs, uniqueDeadline);
      res.status(201).json({ message: 'Students selected successfully.' });
    } catch (error) {
      const err = error as Error;
      console.error('Failed to select students:', err.message);
      res.status(500).json({ error: `Failed to select students`, details: err.message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}