// pages/api/assignments/[assignmentID].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import {  query} from '../../../db'; // Import your actual data fetching function here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID } = req.query;

  if (typeof assignmentID !== 'string') {
    res.status(400).json({ error: 'Invalid assignmentID' });
    return;
  }

  try {
    const Assignment = await getAssignmentById(assignmentID);

    if (Assignment) {
      const submissions = await getSubmitedAssignmentsById(assignmentID);
      res.status(200).json({ ...Assignment, submissions });
    } else {
      res.status(404).json({ error: 'Assignment not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAssignmentById(assignmentID: string): Promise<any> {
  const sql = `

    SELECT * FROM assignment WHERE assignmentID = ?  `;


  try {
    const rows = await query(sql, [assignmentID]);
    return rows[0];
  } catch (error) {
    console.error('Error in getCourse:', error);
    throw error;
  }
  }
  async function getSubmitedAssignmentsById(assignmentID: string): Promise<any[]> {
    const sql = `
      SELECT s.submissionID, s.studentID, s.fileName, s.fileType, s.fileContent, s.submissionDate, s.grade,
             u.firstName, u.lastName
      FROM submission s
      JOIN student st ON s.studentID = st.studentID
      JOIN user u ON st.userID = u.userID
      WHERE s.assignmentID = ?
    `;
    try {
      const rows = await query(sql, [assignmentID]);
      return rows;
    } catch (error) {
      console.error('Error in getSubmissionsByAssignmentId:', error);
      throw error;
    }
  }