// pages/api/submissions/checkSubmission.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID, userID } = req.query;

  if (!assignmentID || !userID) {
    return res.status(400).json({ error: 'Missing assignmentID or userID' });
  }

  try {
    console.log('Checking submission status for assignment', assignmentID, 'and user', userID);
    const result = await checkSubmission(Number(assignmentID), Number(userID));
    return res.json(result);
  } catch (error) {
    console.error('Error checking submission status:', error);
    return res.status(500).json({ error: 'Error checking submission status' });
  }
}



async function checkSubmission(assignmentID: number, userID: number): Promise<{
  isSubmitted: boolean,
  submissionDate: string | null,
  submissionID: number | null,
  assignmentID: number | null,
  fileName: string | null,
  studentName: string | null,
  studentID: number | null,
  isLate: boolean,
  isLink: boolean,
  grade : number | null,
  autoGrade: number | null
}> {
  const sql = `
  SELECT CONCAT(u.firstName, ' ', u.lastName) AS studentName, s.*
  FROM submission s
  JOIN student st ON s.studentID = st.studentID
  JOIN user u ON st.userID = u.userID
  WHERE s.assignmentID = ? AND s.studentID = ?;
  `;
  try {
    let studentID: number;
    const studentIDResult = await getStudentsById(userID);
    if (studentIDResult === null) {
      studentID = userID;
    } else {
      studentID = studentIDResult.studentID;
    }

    const rows = await query(sql, [assignmentID, studentID]);
    console.log(rows);
    if (rows.length > 0) {
      const submissionDate = new Date(rows[0].submissionDate);
      const deadlineDate = new Date(rows[0].deadline);
      const isLate = submissionDate > deadlineDate;
      const isLink = rows[0].fileType === 'link';
      return {
        isSubmitted: true,
        submissionDate: submissionDate.toISOString(),
        submissionID: rows[0].submissionID,
        assignmentID: rows[0].assignmentID,
        fileName: rows[0].fileName,
        studentName: rows[0].studentName,
        studentID: rows[0].studentID,
        isLate,
        isLink,
        grade: rows[0].grade,
        autoGrade: rows[0].autoGrade
      };
    } else {
      return { isSubmitted: false, submissionDate: null, submissionID: null, assignmentID: null, fileName: null, studentName: null, studentID: null, isLate: false, isLink: false, grade: null, autoGrade: null };


    }
  } catch (error) {
    console.error('Error in checkSubmission:', error);
    throw error;
  }
}