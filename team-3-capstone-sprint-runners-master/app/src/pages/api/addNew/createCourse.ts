// pages/api/addNew/createCourse.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createCourse, getInstructorID } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { courseName, instructorID: userID, missingData } = req.body;
    console.log('Received request body:', req.body);

    if (!courseName) {
      return res.status(400).json({ error: 'Missing courseName' });
    }
    if (!userID) {
      return res.status(400).json({ error: 'Missing userID' });
    }

    try {
      // Get the instructorID from the userID
      const instructorID = await getInstructorID(userID);
      
      if (!instructorID) {
        return res.status(400).json({ error: 'Invalid userID or user is not an instructor' });
      }

      const courseId = await createCourse(courseName, instructorID);
      res.status(201).json({ courseId });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({ error: 'Failed to create course', details: (error as Error).message });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}