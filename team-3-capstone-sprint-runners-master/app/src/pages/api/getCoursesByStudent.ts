//api/getCoursesByStudent
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userID } = req.query;
    if (!userID || Array.isArray(userID)) {
      return res.status(400).json({ error: 'Invalid userID' });
    }
    try {
      const courses = await getCourses4Student(Number(userID));
      console.log('Courses fetched:', courses); // Add this log
      res.status(200).json({ courses });
    } catch (error) {
      console.error('Error in handler:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}

async function getCourses4Student(userID: number) {
  const sql = `
    SELECT c.courseID, c.courseName, u.firstName AS instructorFirstName, u.lastName AS instructorLastName
    FROM enrollment e
    JOIN course c ON e.courseID = c.courseID
    JOIN instructor i ON c.instructorID = i.instructorID
    JOIN user u ON i.userID = u.userID
    JOIN student s ON e.studentID = s.studentID
    WHERE s.userID = ? AND c.isArchived = 0
    ORDER BY c.courseID
  `;
  try {
    const results = await query(sql, [userID]);
    return results;
  } catch (error) {
    console.error('Error in getCourses4Student:', error);
    throw error;
  }
}