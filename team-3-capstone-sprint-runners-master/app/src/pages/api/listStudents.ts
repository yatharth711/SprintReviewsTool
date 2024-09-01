// api/listStudents.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { parse } from 'csv-parse';
import { query } from '../../db';
import formidable, { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Define the API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

   //***This function imports students from a CSV file and retrieves their details from the database***
   // Parse csv file uploaded and find database matches
   const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }
    if (!files || !files.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const filePath = files.file[0].filepath;

    const studentsDetails: any[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data: any) => {
        studentsDetails.push(data);
      })
      .on('end', async () => {
        try {
          // Loop through each student and call getStudentsById
          const students = [];
          const missingData = [];
          for (const studentDetail of studentsDetails) {
            const sql = `SELECT * FROM student WHERE studentID = ?`;
            const studentData = await query(sql, [studentDetail.studentID]);
            if (studentData.length > 0) {
              students.push(studentDetail.studentID);
            } else {
              missingData.push(studentDetail.studentID);
            }
          }
          // Respond with the retrieved students and missing IDs
          console.log('Students retrieved successfully', students, missingData);
          res.status(200).json({ message: 'Students retrieved successfully', students, missingData, showInPopup: true });
        } catch (error) {
          console.error(error);
          res.status(500).json({ error: 'Error retrieving students from database' });
        }
      });
  });
}