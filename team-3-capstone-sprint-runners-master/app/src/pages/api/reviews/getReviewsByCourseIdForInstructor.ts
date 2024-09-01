// pages/api/reviews/getReviewsByCourseIdForInstructor.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { courseID } = req.query;
    try {
      const reviews = await getPeerReviewAssignmentsByCourseIDForInstructor(Number(courseID));
      console.log('API response:', reviews);
      res.status(200).json({ reviews });
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

async function getPeerReviewAssignmentsByCourseIDForInstructor(courseID: number) {
  const sql = `
    SELECT DISTINCT r.reviewID as assignmentID, r.assignmentID as linkedAssignmentID, r.deadline, a.title
    FROM review r
    JOIN assignment a ON r.assignmentID = a.assignmentID
    LEFT JOIN review_groups rg ON r.assignmentID = rg.assignmentID
    WHERE a.courseID = ?
  `;
  try {
    const rows = await query(sql, [courseID]);
    return rows;
  } catch (error) {
    console.error('Error in getPeerReviewAssignmentsByCourseIDForInstructor:', error);
    throw error;
  }
}