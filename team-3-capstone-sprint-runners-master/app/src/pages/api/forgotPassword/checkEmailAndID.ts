// // pages/api/forgotPassword/checkEmailAndID.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { query } from "../../../db";

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   const { globalID, email, newPassword } = req.body;

//   if (!globalID || !email) {
//     return res.status(400).json({ message: "Missing required parameters" });
//   }

//   try {
//     const check = await checkEmailAndID(Number(globalID), email);
//     if (check) {
//       if (newPassword) {
//         await resetPassword(email, newPassword);
//         res.status(200).json({ message: "Password reset successful!" });
//       } else {
//         res.status(200).json({ message: "Email and ID match found." });
//       }
//     } else {
//       res
//         .status(404)
//         .json({ message: "No match found for the provided email and ID." });
//     }
//   } catch (error) {
//     console.error("Error in handler:", error);
//     res.status(500).json({ message: "Error checking email and ID" });
//   }
// }

// async function checkEmailAndID(globalID: number, email: string) {
//   const sql = `
//     SELECT student.studentID AS globalID, student.userID, user.email, user.pwd, user.userRole FROM student
//     JOIN user ON student.userID = user.userID
//     UNION ALL
//     SELECT instructor.instructorID AS globalID, instructor.userID, user.email, user.pwd, user.userRole FROM instructor
//     JOIN user ON instructor.userID = user.userID
//     ORDER BY userID ASC;
//     `;
//   try {
//     const results = await query(sql, [globalID, email]);
//     return results.length > 0;
//   } catch (error) {
//     console.error("Error in checkEmailAndID:", error);
//     throw error;
//   }
// }

// async function resetPassword(email: string, newPassword: string) {
//   const sql = `
//         UPDATE user SET pwd = ? WHERE email = ?
//     `;
//   try {
//     await query(sql, [newPassword, email]);
//   } catch (error) {
//     console.error("Error in resetPassword:", error);
//     throw error;
//   }
// }



// pages/api/forgotPassword/checkEmailAndID.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { globalID, email, newPassword } = req.body;

  if (!globalID || !email) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const checkemail = await checkEmail(email);
    const checkID = await checkGlobalID(Number(globalID));
    
    if (checkID && checkemail) {
      if (newPassword) {
        await resetPassword(email, newPassword);
        res.status(200).json({ message: "Password reset successful!" });
      } else {
        res.status(200).json({ message: "Email and ID match found." });
      }
    } else {
      res
        .status(404)
        .json({ message: "No match found for the provided email and ID." });
    }
  } catch (error) {
    console.error("Error in handler:", error);
    res.status(500).json({ message: "Error checking email and ID" });
  }
}

async function checkGlobalID(globalID: number) {
  const sql = `
    SELECT student.studentID AS globalID FROM student
    UNION ALL
    SELECT instructor.instructorID AS globalID FROM instructor
    ORDER BY globalID ASC;
    `;
  try {
    const results = await query(sql, [globalID]);
    return results.length > 0;
  } catch (error) {
    console.error("Error in checkGlobalID:", error);
    throw error;
  }
}

async function checkEmail(email: string) {
  const sql = `
    SELECT user.email FROM user WHERE email = ?;
    `;
  try {
    const results = await query(sql, [email]);
    return results.length > 0;
  } catch (error) {
    console.error("Error in checkEmail:", error);
    throw error;
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
