// pages/api/reviews/getReviewsByCourseId.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { courseID, role } = req.query;
    try {
      const reviews = await getPeerReviewAssignmentsByCourseID(Number(courseID), role as string);
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

async function getPeerReviewAssignmentsByCourseID(courseID: number, role: string) {
  let sql = `
    SELECT DISTINCT 
  r.reviewID as reviewID, 
  r.assignmentID as linkedAssignmentID, 
  r.deadline,
  a.title as title
FROM review r
JOIN assignment a ON r.assignmentID = a.assignmentID
LEFT JOIN review_groups rg ON r.assignmentID = rg.assignmentID
WHERE a.courseID = ?
  `;

  if (role === 'student') {
    sql += ' AND rg.isReleased = true';
  }

  try {
    const rows = await query(sql, [courseID]);
    return rows;
  } catch (error) {
    console.error('Error in getPeerReviewAssignmentsByCourseID:', error);
    throw error;
  }
}