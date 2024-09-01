// pages/api/groups/getGroupDetails.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../db';

async function getGroupDetails(courseID: number, userID: number) {
  const sql = `
    SELECT cg.groupID, s.studentID, u.firstName, u.lastName
    FROM course_groups cg
    JOIN student s ON cg.studentID = s.studentID
    JOIN user u ON s.userID = u.userID
    WHERE cg.courseID = ? AND cg.groupID IN (
      SELECT groupID 
      FROM course_groups 
      WHERE courseID = ? AND studentID = ?
    )
  `;

  try {
    let studentID: number;
    const studentIDResult = await getStudentsById(userID);
    if (studentIDResult === null) {
      studentID = userID;
    } else {
      studentID = studentIDResult.studentID;
    }

    const result = await query(sql, [courseID, courseID, studentID]);
    if (result.length === 0) {
      return null;
    }

    const groupID = result[0].groupID;
    const students = result
      .filter((row: any) => row.studentID !== studentID)
      .map((row: any) => ({
        studentID: row.studentID,
        firstName: row.firstName,
        lastName: row.lastName
      }));

    return { groupID, students };
  } catch (error) {
    console.error('Error in getGroupDetails:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { courseID, userID } = req.query;

  try {
    const groupDetails = await getGroupDetails(parseInt(courseID as string), parseInt(userID as string));
    if (!groupDetails) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.status(200).json(groupDetails);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching group details' });
  }
}