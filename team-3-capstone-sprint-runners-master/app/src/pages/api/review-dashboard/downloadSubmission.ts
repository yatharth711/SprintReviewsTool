// pages/api/review-dashboard/downloadSubmission.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { assignmentID, studentID } = req.query;

  if (!assignmentID || !studentID) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Retrieve the file data from the database
    const fileData = await query('SELECT fileName, fileContent, fileType FROM submission WHERE assignmentID = ? AND studentID = ?', [assignmentID, studentID]);

    if (fileData.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const { fileName, fileContent, fileType } = fileData[0];

    // Check if the submission is a link
    if (fileType === 'link') {
      // Return the link content as a string
      return res.status(200).json({ link: fileContent.toString() });
    }

    // For file submissions, send the file to the client
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Type', fileType || 'application/octet-stream');

    // Convert the Buffer to a string if it's stored as binary data
    const fileBuffer = Buffer.from(fileContent, 'binary');
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}
