// pages/api/assignments/submitAssignment.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { query, getStudentsById } from '../../../db';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ success: false, message: 'Error processing request' });
    }

    try {
      const assignmentID = Array.isArray(fields.assignmentID) ? fields.assignmentID[0] : fields.assignmentID;
      const userID = Array.isArray(fields.userID) ? fields.userID[0] : fields.userID;
      const isGroupAssignment = Array.isArray(fields.isGroupAssignment) ? fields.isGroupAssignment[0] : fields.isGroupAssignment;
      const groupID = Array.isArray(fields.groupID) ? fields.groupID[0] : fields.groupID;
      let students = fields.students;
      const link = fields.link;

      if (!assignmentID || !userID) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      // Parse students if it is a string (assuming it comes as a JSON string)
      if (typeof students?.[0] === 'string') {
        students = JSON.parse(students[0]);
      } else if (Array.isArray(students)) {
        students = students.map(id => String(id));
      }

      // Convert userID to studentID
      const studentIDResult = await getStudentsById(parseInt(userID));
      if (!studentIDResult) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const studentID = studentIDResult.studentID;

      // Set studentIDList to either the studentID or the list of student IDs in the group
      const studentIDList = [studentID];
      if (isGroupAssignment === '1' && Array.isArray(students)) {
        studentIDList.push(...students);
      }

      const parsedGroupID = groupID ? parseInt(groupID) : null;

      const results = await Promise.all(
        studentIDList.map(async (id) => {
          if (files.file) {
            // Handle file submission
            const file = Array.isArray(files.file) ? files.file[0] : files.file;
            const fileContent = await fs.readFile(file.filepath);
            const fileName = file.originalFilename || 'unnamed_file';
            const fileType = file.mimetype || 'application/octet-stream';

            const result = await submitAssignment(
              Number(assignmentID),
              id,
              fileName,
              fileContent,
              fileType,
              isGroupAssignment === '1' ? parsedGroupID : null
            );

            return result;
          } else if (link) {
            // Handle link submission
            const result = await submitAssignment(
              Number(assignmentID),
              id,
              link[0],
              link[0],
              'link',
              isGroupAssignment === '1' ? parsedGroupID : null
            );
            return result;
          } else {
            throw new Error('No file or link provided');
          }
        })
      );

      // Delete the temporary file after all submissions are complete
      if (files.file) {
        const file = Array.isArray(files.file) ? files.file[0] : files.file;
        await fs.unlink(file.filepath);
      }

      res.status(200).json({ success: true, message: 'Assignment submitted successfully', results });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      res.status(500).json({ success: false, message: 'Error submitting assignment' });
    }
  });
}

async function submitAssignment(
  assignmentID: number,
  studentID: number,
  fileName: string,
  fileContent: Buffer | string,
  fileType: string,
  groupID?: number | null
) {
  const checkExistingSQL = `SELECT submissionID FROM submission WHERE assignmentID = ? AND studentID = ?`;
  const insertSQL = `
    INSERT INTO submission (assignmentID, studentID, fileName, fileContent, fileType, submissionDate, groupID)
    VALUES (?, ?, ?, ?, ?, NOW(), ?)
  `;
  const updateSQL = `
    UPDATE submission
    SET fileName = ?, fileContent = ?, fileType = ?, submissionDate = NOW(), groupID = ?
    WHERE submissionID = ?
  `;

  try {
    // Check if a submission already exists
    const existingSubmission = await query(checkExistingSQL, [assignmentID, studentID]);

    if (existingSubmission && existingSubmission.length > 0) {
      // Update existing submission
      await query(updateSQL, [fileName, fileContent, fileType, groupID, existingSubmission[0].submissionID]);
      return { success: true, message: 'Assignment resubmitted successfully' };
    } else {
      // Insert new submission
      await query(insertSQL, [assignmentID, studentID, fileName, fileContent, fileType, groupID]);
      return { success: true, message: 'Assignment submitted successfully' };
    }
  } catch (error) {
    console.error('Error in submitAssignment:', error);
    throw error;
  }
}