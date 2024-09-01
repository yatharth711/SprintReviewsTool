/*
* This API call is used to create randomized groups.
* It will take an int as the number of students per group, an array of student IDs, as well as a courseID.
* It then calls the randomization function to create the groups, before calling the database query to add them.
*/

// /pages/api/groups/createGroups.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createGroups } from '../../../db';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groups, courseID } = req.body;

  if (!Array.isArray(groups) || groups.length === 0) {
    return res.status(400).json({ error: 'Invalid group input' });
  }

  try {
    await createGroups(groups, courseID);

    res.status(201).json({ message: 'Groups created successfully', groups });
  } catch (error) {
    console.error('Error creating groups:', error);
    res.status(500).json({ error: 'Error creating groups', details: (error as Error).message });
  }
};

export default handler;
