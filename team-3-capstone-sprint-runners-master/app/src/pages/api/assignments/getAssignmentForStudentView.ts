import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';
/**
 * Handles the API request for retrieving user assignments based on the provided course ID.
 *
 * @param {NextApiRequest} req - The request object containing the HTTP method and query parameters.
 * @param {NextApiResponse} res - The response object used to send the HTTP response.
 * @return {Promise<void>} A promise that resolves when the response is sent.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { courseID } = req.query;
    try {
      const courses = await getUserAssignments(Number(courseID));
      res.status(200).json({ courses });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
/**
 * Retrieves user assignments based on the provided course ID.
 *
 * @param {number} courseID - The ID of the course for which assignments are to be retrieved.
 * @return {Promise<any>} A promise that resolves to the assignments for the specified course.
 */
async function getUserAssignments(courseID: number) {
  const sql = `
    SELECT assignmentID, title, deadline, descr
    FROM assignment
    WHERE courseID = ? 
  `;
  try {
    const results = await query(sql, [courseID]);
    return results;
  } catch (error) {
    console.error('Error in getUserAssignments:', error);
    throw error;
  }
}