// pages/api/forgotPassword/resetPassword.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Please fill out all fields before you continue." });
  }

  try {
    await resetPassword(email, newPassword);
    res.status(200).json({ message: "" });
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ message: "Error updating password" });
  }
}

async function resetPassword(email: string, newPassword: string) {
  const sql = `
        UPDATE user SET pwd = ? WHERE email = ?
    `;
  try {
    await query(sql, [newPassword, email]);
  } catch (error) {
    console.error("Error in resetPassword:", error);
    throw error;
  }
}