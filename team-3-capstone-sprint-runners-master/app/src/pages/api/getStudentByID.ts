// pages/api/getStudentByID.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getStudentsById } from '../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userID } = req.query;

  if (!userID) {
    return res.status(400).json({ message: 'userID is required' });
  }

  try {
    const student = await getStudentsById(Number(userID));

    if (student) {
      res.status(200).json({ student });
    } else {
      res.status(404).json({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error fetching student information:', error);
    res.status(500).json({ message: 'Error fetching student information' });
  }
}