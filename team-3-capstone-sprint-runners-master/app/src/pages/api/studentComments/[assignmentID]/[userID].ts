import { NextApiRequest, NextApiResponse } from 'next';
import { query,  } from '../../../../db'; // Adjust the path to your DB connection module

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID, userID } = req.query;

  
  // converts userID to  studentID 
  
  if (req.method === 'GET') {
    try {
      const result = await query(
        `SELECT f.*, s.userID, s.studentID
        FROM instructor_feedback f join student s on s.studentID = f.studentID
        WHERE assignmentID = ? AND userID = ?
        ORDER BY feedbackDate DESC`,
        [assignmentID, userID]
      );
      res.status(200).json(result);
      console.log(result);
      console.log("StudentID: ",userID);
        console.log("assignmentID: ",assignmentID);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching comments' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

