import { NextApiRequest, NextApiResponse } from 'next';
import { enrollStudent } from '../../../db'; // Assuming you have this function implemented
import fs from 'fs';
import path from 'path';

// This function handles adding students to the database under a given courseID
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentIDs, courseID, missingData } = req.body;
  const missingStudents: number[] = missingData ? missingData.map(Number) : [];

  if (!Array.isArray(studentIDs) || studentIDs.length === 0) {
    return res.status(400).json({ error: 'Invalid studentIDs array' });
  }

  // Enrolling an individual student
  if (studentIDs.length <= 1) {
    try {
      await enrollStudent(studentIDs.toString(), courseID.toString());
      return res.status(201).json({ courseID, studentIDs });
    } catch (error) {
      const err = error as any;
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(405).json({ error: `Student ${studentIDs} is already enrolled in course ${courseID}` });
      } else if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(409).json({ error: `Student ${studentIDs} does not exist in the database` });
      } else {
        console.error(`Failed to enroll student: ${studentIDs} in course: ${courseID}. Error:`, err.message);
        return res.status(500).json({ error: `Failed to enroll student ${studentIDs}`, details: err.message });
      }
    }
  }

  // Enrolling a list of students from a .csv
  try {
    console.log("Enrolling students:", studentIDs);
    for (const userID of studentIDs) {
      try {
        await enrollStudent(userID.toString(), courseID.toString());
        console.log(`Enrolled student: ${userID} in course: ${courseID}`);
      } catch (error) {
        const err = error as any;
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Student ${userID} is already enrolled in course ${courseID}`);
        } else {
          console.error(`Failed to enroll student: ${userID} in course: ${courseID}. Error:`, err.message);
          missingStudents.push(userID);
        }
      }
    }

    if (missingStudents.length > 0) {
      const missingStudentsCSV = ['studentID', ...missingStudents].join('\n');
      const missingDataFilePath = path.join(process.cwd(), 'public', `course${courseID}_missingStudents.csv`);
      fs.writeFileSync(missingDataFilePath, missingStudentsCSV);
    }

    return res.status(201).json({
      courseID,
      studentIDs,
      missingStudentsFilePath: missingStudents.length > 0 ? `/public/course${courseID}_missingStudents.csv` : null
    });
  } catch (error) {
    console.error(`Critical error: Failed to enroll students in course: ${courseID}. Error:`, (error as Error).message);
    return res.status(500).json({
      error: `Failed to enroll students in course ${courseID}`,
      details: (error as Error).message
    });
  }
}
