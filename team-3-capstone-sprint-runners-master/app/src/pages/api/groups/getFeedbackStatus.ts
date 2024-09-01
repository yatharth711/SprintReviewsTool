// pages/api/groups/getFeedbackStatus.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../db';

async function checkFeedbackStatus(assignmentID: number, reviewerID: number) {
  const sql = `
    SELECT COUNT(*) as feedbackCount
    FROM group_feedback
    WHERE assignmentID = ? AND reviewerID = ?
  `;

  try {
    let studentID: number;
    const studentIDResult = await getStudentsById(reviewerID);
    if (studentIDResult === null) {
      studentID = reviewerID;
    } else {
      studentID = studentIDResult.studentID;
    }
    
    const result = await query(sql, [assignmentID, studentID]);
    console.log("Feedback result: ", result);
    return result[0].feedbackCount > 0;
  } catch (error) {
    console.error('Error in checkFeedbackStatus:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { assignmentID, reviewerID } = req.query;

  try {
    const isFeedbackSubmitted = await checkFeedbackStatus(parseInt(assignmentID as string), parseInt(reviewerID as string));
    res.status(200).json({ isFeedbackSubmitted });
  } catch (error) {
    res.status(500).json({ message: 'Error checking feedback status' });
  }
}