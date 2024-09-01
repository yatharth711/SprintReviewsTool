// pages/api/reviews/[reviewID].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db'; // Import your actual data fetching function here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { reviewID } = req.query;

  if (typeof reviewID !== 'string') {
    res.status(400).json({ error: 'Invalid reviewID' });
    return;
  }

  try {
    const review = await getReviewById(reviewID);
    const reviewCriteria = await getReviewCriteriaByReviewId(review.assignmentID);

    if (review) {
      res.status(200).json({ ...review, reviewCriteria });
    } else {
      res.status(404).json({ error: 'Review not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getReviewById(reviewID: string): Promise<any> {
    const sql = `
      SELECT r.reviewID, r.assignmentID, r.deadline,r.startDate,r.endDate, a.title as assignmentName
      FROM review r
      JOIN assignment a ON r.assignmentID = a.assignmentID
      WHERE r.reviewID = ?  
    `;
    try {
      const rows = await query(sql, [reviewID]);
      return rows[0];
    } catch (error) {
      console.error('Error in getReview:', error);
      throw error;
    }
  }
  
  

  export async function getReviewCriteriaByReviewId(assignmentID: string): Promise<any> {
    const sql = `
      SELECT rc.criteriaID, rc.criterion, rc.maxMarks
      FROM review_criteria rc
      WHERE rc.assignmentID = ?  
    `;
    try {
      const rows = await query(sql, [assignmentID]);
      return rows;
    } catch (error) {
      console.error('Error in getReviewCriteriaByReviewId:', error);
      throw error;
    }
  }
  