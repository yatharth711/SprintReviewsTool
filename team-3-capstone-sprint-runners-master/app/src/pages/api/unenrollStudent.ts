// unenrollStudent.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentID, courseID } = req.body;

  if (!studentID || !courseID) {
    return res.status(400).json({ message: 'Missing studentID or courseID' });
  }

  try {
    // Remove the student from the enrollment table
    const result = await query('DELETE FROM enrollment WHERE studentID = ? AND courseID = ?', [studentID, courseID]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: `Successfully unenrolled student ${studentID} from course ${courseID}` });
    } else {
      return res.status(404).json({ message: 'Student or course not found' });
    }
  } catch (error) {
    console.error('Failed to unenroll student:', error);
    return res.status(500).json({ message: 'Failed to unenroll student', error: (error as Error).message });
  }
}
