import { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { assignmentID, studentID } = req.query;

  if (!assignmentID || !studentID) {
    res.status(400).json({ message: 'Missing assignmentID or studentID' });
    return;
  }

  try {
    const SQL = 
      `SELECT gf.assignmentID, gf.score, gf.content, gf.reviewerID, gf.revieweeID, 
              u.firstName AS reviewerFirstName, u.lastName AS reviewerLastName, 
              ru.firstName AS revieweeFirstName, ru.lastName AS revieweeLastName
       FROM group_feedback gf
       JOIN student s ON gf.reviewerID = s.studentID
       JOIN user u ON s.userID = u.userID
       JOIN student rs ON gf.revieweeID = rs.studentID
       JOIN user ru ON rs.userID = ru.userID
       WHERE gf.assignmentID = ? AND gf.revieweeID = ?`;

    // Convert userID to studentID
    let revieweeID: number;
    const studentIDResult = await getStudentsById(Number(studentID));
    if (studentIDResult === null) {
      revieweeID = Number(studentID);
    } else {
      revieweeID = studentIDResult.studentID;
    }
    const rows = await query(SQL, [assignmentID, revieweeID]);

    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}