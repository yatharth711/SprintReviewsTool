import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db'; // Adjust the path to your DB connection module

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { action, feedbackID, assignmentID, courseID, studentID, reviewerID, comment } = req.body;
    try {
      if (action === 'add') {
        const result = await query(
          `INSERT INTO instructor_feedback (assignmentID, courseID, studentID, comment) VALUES (?, ?, ?, ?)`,
          [assignmentID, courseID, studentID, comment]
        );
        res.status(200).json({ feedbackID: result.insertId });
        
      } else if (action === 'update') {
        await query(
          `UPDATE instructor_feedback SET  comment = ?, lastUpdated = NOW() WHERE feedbackID = ?`,
          [ comment, feedbackID]
        );
        res.status(200).json({ message: 'Feedback updated successfully' });
      } else {
        res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Error processing request' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
