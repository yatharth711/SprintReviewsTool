// /pages/api/groups/randomizeGroups.ts
import type { NextApiRequest, NextApiResponse } from 'next';

const randomizeGroups = (students: number[], groupSize: number): number[][] => {
  const shuffledStudents = students.sort(() => Math.random() - 0.5);
  const numberOfGroups = Math.ceil(shuffledStudents.length / groupSize);
  const groups: number[][] = Array.from({ length: numberOfGroups }, () => []);

  shuffledStudents.forEach((student, index) => {
    groups[index % numberOfGroups].push(student);
  });

  return groups;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { groupSize, studentIds } = req.body;

  if (!groupSize || !Array.isArray(studentIds) || studentIds.length === 0) {
    return res.status(400).json({ error: 'Invalid request. Ensure there are students enrolled in this course.' });
  }
  if (groupSize > studentIds.length) {
    return res.status(400).json({ error: 'Group size is larger than the number of students' });
  }

  try {
    const groups = randomizeGroups(studentIds, groupSize);
    const responseGroups = groups.map((group, index) => ({
      id: index + 1, // Generate an id for the group
      members: group,
    }));

    res.status(201).json({ message: 'Groups created successfully', groups: responseGroups });
  } catch (error) {
    res.status(500).json({ error: 'Error creating groups', details: (error as Error).message });
  }
};

export default handler;
