// pages/api/peer-reviews/[assignmentID]/[studentID].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../../db'; // Import your database query function

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID, studentID } = req.query;

  console.log("Fetching feedbacks for assignment", assignmentID, "for student", studentID);

  if (typeof assignmentID !== 'string' || typeof studentID !== 'string') {
    res.status(400).json({ error: 'Invalid assignmentID or studentID' });
    return;
  }

  try {
    // const studentIDResponse = await getStudentsById(Number(studentID));
    // const student = studentIDResponse.studentID;

    console.log("Fetching feedbacks for assignment", assignmentID, "for student", studentID);

    const feedbacks = await getFeedbacksForAssignment(assignmentID, studentID);
    console.log(feedbacks);
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getFeedbacksForAssignment(assignmentID: string, studentID: string) {
  const sql = `
    SELECT f.feedbackID, f.reviewerID, f.feedbackDetails, f.feedbackDate, f.lastUpdated, f.comment, s.autoGrade
    FROM feedback f
    JOIN submission s ON f.revieweeID = s.studentID
    WHERE f.assignmentID = ? AND s.studentID = ?
  `;
  try {
    const rows = await query(sql, [assignmentID, studentID]);
    return rows;
  } catch (error) {
    console.error('Error in getFeedbacksForAssignment:', error);
    throw error;
  }
}