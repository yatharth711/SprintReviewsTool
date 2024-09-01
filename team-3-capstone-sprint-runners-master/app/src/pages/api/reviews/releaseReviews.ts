import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../db';
import nodemailer from 'nodemailer';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { assignmentID, autoReleaseDate } = req.body;

  if (!assignmentID) {
    return res.status(400).json({ error: 'Assignment ID is required' });
  }

  try {
    // Check if auto-release has been scheduled
    const [existingAutoRelease] = await query('SELECT autoReleaseDate FROM review_groups WHERE assignmentID = ?', [assignmentID]);

    if (existingAutoRelease && existingAutoRelease.autoReleaseDate) {
      return res.status(400).json({ error: 'Auto-release has already been scheduled' });
    }

    // Release the reviews immediately if auto-release is not scheduled
    if (!autoReleaseDate) {
      await query('UPDATE review_groups SET isReleased = TRUE WHERE assignmentID = ?', [assignmentID]);
    } else {
      // Schedule the auto-release
      await query('UPDATE review_groups SET autoReleaseDate = ? WHERE assignmentID = ?', [autoReleaseDate, assignmentID]);
    }

    // Fetch assignment and course details
    const [assignment] = await query('SELECT title AS assignmentName, courseID FROM assignment WHERE assignmentID = ?', [assignmentID]);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const [course] = await query('SELECT courseName FROM course WHERE courseID = ?', [assignment.courseID]);
    console.log("assignment details", assignment);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Fetch all students involved in this assignment
    const students = await query(`
      SELECT DISTINCT u.userID, u.firstName, u.email
      FROM user u
      JOIN student s ON u.userID = s.userID
      JOIN review_groups rg ON s.studentID = rg.studentID OR s.studentID = rg.revieweeID
      WHERE rg.assignmentID = ?
    `, [assignmentID]);

    // Set up email transporter
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Send emails to all students
    for (const student of students) {
      
      let mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: student.email,
        subject: 'Assignment Released for Review',
        html: `<div style="padding: 5px;">
                <h2>Sprint Reviews Assignment Notification</h2>
                <hr />
                <div>
                  <p>Hello ${student.firstName},</p>
                  <p>The assignment "${assignment.assignmentName}" in ${course.courseName} has been released for peer review. Please log in to the Sprint Reviews platform to start your review process.</p>
                  <p>Best regards,</p>
                  <p>The Sprint Reviews Team :)</p>
                </div>`
      };

      try {
        
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${student.email}`);
        
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error);
      }
    }

    res.status(200).json({ message: 'Reviews released successfully and emails sent' });
  } catch (error) {
    console.error('Error in releaseReviews API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
