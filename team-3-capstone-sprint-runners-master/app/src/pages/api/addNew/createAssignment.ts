// createAssignment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { addAssignmentToCourse } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, startDate, endDate, dueDate, file, groupAssignment, courseID, allowedFileTypes } = req.body;

    if (!title || !description || !dueDate || !courseID || !allowedFileTypes) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      console.log('Received courseID:', courseID);
      const result = await addAssignmentToCourse(title, description, startDate, endDate, dueDate, file, groupAssignment, Number(courseID), allowedFileTypes);
      console.log('Assignment creation result:', result);
      res.status(200).json({ message: 'Assignment created successfully', result });
    } catch (error: any) {
      console.error('Error in createAssignment:', error);
      res.status(500).json({ 
        message: 'An error occurred while creating the assignment', 
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}