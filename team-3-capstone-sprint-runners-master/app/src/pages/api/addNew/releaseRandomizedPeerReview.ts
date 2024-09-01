import type { NextApiRequest, NextApiResponse } from 'next';
import { selectStudentForSubmission, query } from '../../../db';
import { randomizePeerReviewGroups } from './randomizationAlgorithm';

type ReviewGroup = {
  revieweeID: number;
  reviewers: number[];
};

// This function will insert the rows of students to review the single submission, 
// for each submission in the peerReviewGroups array, connected to the courseID and assignmentID.
const processPeerReviewGroups = async (peerReviewGroups: ReviewGroup[], assignmentID: number, courseID: number) => {
  for (const group of peerReviewGroups) {
    for (const student of group.reviewers) {
      await selectStudentForSubmission(student, assignmentID, courseID, group.revieweeID);
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reviewsPerAssignment, students, assignmentID } = req.body;

  if (!reviewsPerAssignment || !assignmentID || !Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const sql = `SELECT courseID FROM assignment WHERE assignmentID = ?`;
    const result = await query(sql, [assignmentID]);

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Course ID not found for the given assignment ID' });
    }

    const courseID = result[0].courseID;

    console.log('Students:', students);

    // Call the randomizePeerReviewGroups function to create the peer review groups
    const peerReviewGroups = randomizePeerReviewGroups(students, reviewsPerAssignment);

    console.log('Peer review groups:', peerReviewGroups);

    // Process the peer review groups
    await processPeerReviewGroups(peerReviewGroups, assignmentID, courseID);

    res.status(201).json({ message: 'Peer review groups created successfully', peerReviewGroups });
  } catch (error) {
    res.status(500).json({ error: 'Error creating peer review groups', details: (error as Error).message });
  }
};

export default handler;
