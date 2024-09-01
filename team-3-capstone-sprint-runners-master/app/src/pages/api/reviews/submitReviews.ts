// File: pages/api/reviews/submitReviews.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById, updateSubmission } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { assignmentID, reviews, userID } = req.body;

    if (!assignmentID || !Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    const reviewerID = await getStudentsById(userID);

    try {
      for (const review of reviews) {
        const { revieweeID, feedbackDetails, comment } = review;

        console.log('Submitting review for reviewee', revieweeID, 'by reviewer', reviewerID.studentID);
        console.log('Feedback details:', feedbackDetails);
        console.log('Comment:', comment);

        if (!revieweeID || !feedbackDetails || !comment) {
          throw new Error('Invalid review data: missing revieweeID, feedbackDetails, or comment');
        }

        const existingFeedback = await query(
          'SELECT feedbackID FROM feedback WHERE revieweeID = ? AND assignmentID = ? AND reviewerID = ?',
          [revieweeID, assignmentID, reviewerID.studentID]
        );

        if (existingFeedback.length > 0) {
          await query(
            'UPDATE feedback SET feedbackDetails = ?, comment = ?, lastUpdated = NOW() WHERE revieweeID = ? AND assignmentID = ? AND reviewerID = ?',
            [JSON.stringify(feedbackDetails), comment, revieweeID, assignmentID, reviewerID.studentID]
          );
        } else {
          await query(
            'INSERT INTO feedback (revieweeID, assignmentID, feedbackDetails, comment, reviewerID, feedbackDate, lastUpdated) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [revieweeID, assignmentID, JSON.stringify(feedbackDetails), comment, reviewerID.studentID]
          );
        }

        // Calculate and update average grade for the submission
        await calculateAndUpdateAverageGrade(revieweeID, assignmentID);
      }

      res.status(200).json({ message: 'Reviews submitted successfully' });
    } catch (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error submitting reviews:', error);
    res.status(500).json({ message: 'Error submitting reviews', error: (error as Error).message });
  }
}

async function calculateAndUpdateAverageGrade(revieweeID: number, assignmentID: number) {
  try {
    // Fetch all feedback details for the given revieweeID and assignmentID
    const feedbacks = await query(
      'SELECT feedbackDetails FROM feedback WHERE revieweeID = ? AND assignmentID = ?',
      [revieweeID, assignmentID]
    );

    // Fetch all criteria maxMarks for the given assignmentID
    const criteria = await query(
      'SELECT criteriaID, maxMarks FROM review_criteria WHERE assignmentID = ?',
      [assignmentID]
    );

    const criteriaMap = new Map(criteria.map((c: { criteriaID: number; maxMarks: number }) => [c.criteriaID, c.maxMarks]));

    let totalGrades = 0;
    let totalMaxMarks = 0;

    feedbacks.forEach((feedback: { feedbackDetails: string }) => {
      const feedbackDetails = JSON.parse(feedback.feedbackDetails);

      feedbackDetails.forEach((detail: { criteriaID: number; grade: number }) => {
        const maxMarks = criteriaMap.get(detail.criteriaID);
        if (maxMarks) {
          totalGrades += detail.grade;
          totalMaxMarks += Number(maxMarks);
        }
      });
    });

    const averageGrade = totalMaxMarks > 0 ? ((totalGrades / totalMaxMarks) * 100) : 0;

    // Fetch submissionID for the given revieweeID and assignmentID
    const submission = await query(
      'SELECT submissionID FROM submission WHERE studentID = ? AND assignmentID = ?',
      [revieweeID, assignmentID]
    );

    await updateSubmission(submission[0].submissionID, undefined, undefined, undefined, undefined, undefined, undefined, averageGrade.toString(), undefined);

  } catch (error) {
    console.error('Error calculating and updating average grade:', error);
    throw error;
  }
}
