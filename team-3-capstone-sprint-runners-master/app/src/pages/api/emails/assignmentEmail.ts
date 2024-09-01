import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { firstName, email, courseName } = req.body;


    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });    

    let mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Assignment Created',
      text: 'You have a new Assignment',
      html: `<div style="padding: 5px;">
              <h2>Sprint Reviews Assignment Notification</h2>
              <hr />
              <div>
                <p>Hello ${firstName},</p>
                <p>A new assignment has been assigned to you in ${courseName} . Please head to the course dashboard for further details on the assignment.
                </p>
                <p>Best regards,</p>
                <p>The Sprint Reviews Team :)</p>
              <div/>
            </div>`

};
try {
  await transporter.sendMail(mailOptions);
  res.status(200).json({ success: true });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'Error sending email' });
}

  } else {
    res.status(405).json({ error: 'We only accept POST' });
  }
}