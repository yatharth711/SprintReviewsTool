import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { userID, firstName, lastName, email } = req.body;

    if (!userID || (!firstName && !lastName && !email)) {
      return res.status(400).json({ error: 'User ID and at least one field to update are required' });
    }

    try {
      let updateQuery = 'UPDATE user SET ';
      const updateFields = [];
      const queryParams = [];

      if (firstName) {
        updateFields.push('firstName = ?');
        queryParams.push(firstName);
      }
      if (lastName) {
        updateFields.push('lastName = ?');
        queryParams.push(lastName);
      }
      if (email) {
        updateFields.push('email = ?');
        queryParams.push(email);
      }

      updateQuery += updateFields.join(', ') + ' WHERE userID = ?';
      queryParams.push(userID);

      await query(updateQuery, queryParams);

      return res.status(200).json({ message: 'User details updated successfully' });
    } catch (error) {
      console.error('Error updating user details:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}