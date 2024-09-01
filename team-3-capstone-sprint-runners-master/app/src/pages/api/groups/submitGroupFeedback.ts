// pages/api/groups/submitGroupFeedback.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById, updateSubmission } from '../../../db';

export async function calculateAndUpdateAverageGrade(assignmentID: number, revieweeID: number) {
  try {
    // Fetch all feedback for the revieweeID and assignmentID
    const feedbackSql = `
      SELECT score
      FROM group_feedback
      WHERE assignmentID = ? AND revieweeID = ?
    `;
    const feedbacks = await query(feedbackSql, [assignmentID, revieweeID]);

    // Fetch the submissionID for the revieweeID and assignmentID
    const submissionSql = `
      SELECT submissionID
      FROM submission
      WHERE assignmentID = ? AND studentID = ?
    `;
    const submissionID = await query(submissionSql, [assignmentID, revieweeID]);

    // Calculate the average score
    const totalScore = feedbacks.reduce((sum: number, feedback: { score: number }) => sum + feedback.score, 0);
    const averageScore = feedbacks.length > 0 ? totalScore / feedbacks.length : 0;

    // Call updateSubmission to update the autoGrade for the revieweeID and assignmentID
    await updateSubmission(submissionID[0].submissionID, undefined, undefined, undefined, undefined, undefined, undefined, averageScore.toString(), undefined);

    return { success: true };
  } catch (error) {
    console.error('Error in calculateAndUpdateAverageGrade:', error);
    throw error;
  }
}

async function submitGroupFeedback(feedbacks: any[], assignmentID: number, reviewerID: number) {
  const sql = `
    INSERT INTO group_feedback (assignmentID, reviewerID, revieweeID, score, content)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const studentID = await getStudentsById(reviewerID);
    const promises = feedbacks.map(async feedback => {
      if (studentID.studentID !== feedback.revieweeID) {
        await query(sql, [assignmentID, studentID.studentID, feedback.revieweeID, feedback.score, feedback.content]);
        // Calculate and update average grade for revieweeID
        await calculateAndUpdateAverageGrade(assignmentID, feedback.revieweeID);
      }
    });
    await Promise.all(promises);
    return { success: true };
  } catch (error) {
    console.error('Error in submitGroupFeedback:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { feedbacks, assignmentID, reviewerID } = req.body;
    const result = await submitGroupFeedback(feedbacks, assignmentID, reviewerID);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting feedback' });
  }
}
