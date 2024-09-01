// pages/api/forgotPassword/checkEmail.ts
import { NextApiRequest, NextApiResponse } from "next";
import { query } from "@/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method not allowed" });
    }
  
    const { email, globalID } = req.body; // Fetch both email and globalID
  
    if (!email || !globalID) {
      return res.status(400).json({ message: "Please fill out every field before you continue." });
    }
  
    try {
      const checkEmailResult = await checkEmail(email, globalID); // Pass both email and globalID to checkEmail function
      if (checkEmailResult) {
        res.status(200).json({ message: "", user: checkEmailResult });
      } else {
        res.status(404).json({ message: "Email and ID do not match." });
      }
    } catch (error) {
      console.error("Error in handler:", error);
      res.status(500).json({ message: "Error checking email and ID" });
    }
  }

async function checkEmail(email: string, globalID: number) {
    const sql = `
      SELECT s.studentID AS globalID, s.userID, u.email, u.userRole FROM student s join user u on u.userID=s.userID WHERE u.email = ? AND s.studentID = ?
      UNION ALL
      SELECT i.instructorID AS globalID, i.userID, u.email, u.userRole FROM instructor i join user u on u.userID=i.userID WHERE u.email = ? AND i.instructorID = ?
    `;
    try {
      const results = await query(sql, [email, globalID, email, globalID]);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Error in checkEmail:", error);
      throw error;
    }
  }
  