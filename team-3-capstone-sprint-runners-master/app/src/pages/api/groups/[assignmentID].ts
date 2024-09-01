// pages/api/groups/[assignmentID].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getReviewGroups, getStudentDetails } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID } = req.query;

  try {
    // Fetch all review groups for the assignment
    const reviewGroups = await getReviewGroups(undefined, Number(assignmentID), undefined, 'revieweeID');

    if (reviewGroups.length > 0) {
      // Extract all unique student IDs
      const studentIDs = new Set<number>();
      reviewGroups.forEach((group: any) => {
        studentIDs.add(group.revieweeID);
        group.reviewerIDs.forEach((id: number) => studentIDs.add(id));
      });

      const studentDetails = await getStudentDetails(Array.from(studentIDs));

      // Enhance the review groups with student names
      const enhancedReviewGroups = reviewGroups.map((group: any) => {
        return {
          reviewee: studentDetails[group.revieweeID],
          reviewers: group.reviewerIDs.map((id: number) => studentDetails[id])
        };
      });

      res.status(200).json({ groups: enhancedReviewGroups });
    } else {
      res.status(404).json({ error: 'No review groups found' });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
