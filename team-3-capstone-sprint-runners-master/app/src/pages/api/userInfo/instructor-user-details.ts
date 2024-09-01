import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db'; // Import your actual data fetching function here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const user = await query(`
        SELECT u.firstName, u.lastName, u.email, i.instructorID
        FROM user u
        LEFT JOIN instructor i ON u.userID = i.userID
        WHERE u.userID = ?
      `, [userID]);

      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(user[0]);
    } catch (error) {
      console.error('Error fetching user details:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  } else if (req.method === 'PUT') {
    const { userID, firstName, lastName, email, instructorID } = req.body;

    if (!userID) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const updateFields = [];
      const params = [];

      if (firstName) {
        updateFields.push('firstName = ?');
        params.push(firstName);
      }
      if (lastName) {
        updateFields.push('lastName = ?');
        params.push(lastName);
      }
      if (email) {
        updateFields.push('email = ?');
        params.push(email);
      }

      if (updateFields.length > 0) {
        const userUpdateSql = `UPDATE user SET ${updateFields.join(', ')} WHERE userID = ?`;
        await query(userUpdateSql, [...params, userID]);
      }

      if (instructorID !== undefined) {
        const existingInstructor = await query('SELECT * FROM instructor WHERE userID = ?', [userID]);

        if (existingInstructor.length === 0) {
          await query('INSERT INTO instructor (instructorID, userID) VALUES (?, ?)', [instructorID, userID]);
        } else {
          const oldInstructorID = existingInstructor[0].instructorID;
          await query('UPDATE course SET instructorID = ? WHERE instructorID = ?', [instructorID, oldInstructorID]);
          await query('UPDATE instructor SET instructorID = ? WHERE userID = ?', [instructorID, userID]);
        }
      }

      const updatedUser = await query(`
        SELECT u.firstName, u.lastName, u.email, i.instructorID
        FROM user u
        LEFT JOIN instructor i ON u.userID = i.userID
        WHERE u.userID = ?
      `, [userID]);

      return res.status(200).json(updatedUser[0]);
    } catch (error) {
      console.error('Error updating user details:', error);
      return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

