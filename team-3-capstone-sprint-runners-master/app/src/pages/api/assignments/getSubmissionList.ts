// This file is responsible for fetching the list of student submissions for a given assignment
import type { NextApiRequest, NextApiResponse } from 'next';
import { getStudentSubmissions } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Get submission list");
  if (req.method === 'POST') {
    const { assignmentID } = req.body; // Correct the way of getting assignmentID
    try {
      console.log("Assignment ID", assignmentID);
      const studentSubmissions = await getStudentSubmissions(Number(assignmentID));
      console.log("Student submissions", studentSubmissions);
      const formattedSubmissions = studentSubmissions.map(submission => ({
        studentID: submission.studentID,
        submissionID: submission.submissionID
      }));
      console.log("Formatted submissions", formattedSubmissions);
      res.status(200).json({ formattedSubmissions });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
