// pages/api/submissions/[assignmentID]/group-students.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { assignmentID } = req.query;

    if (!assignmentID) {
        return res.status(400).json({ error: 'Missing assignmentID' });
    }

    try {
        const submittedGroups = await getSubmittedGroups(Number(assignmentID));
        const remainingGroups = await getRemainingGroups(Number(assignmentID));
        return res.json({ submittedGroups, remainingGroups });
    } catch (error) {
        console.error('Error fetching group students:', error);
        return res.status(500).json({ error: 'Error fetching group students' });
    }
}

async function getSubmittedGroups(assignmentID: number): Promise<{ groupID: number, groupName: string, members: { studentID: number, name: string, fileName: string }[] }[]> {
    const sql = `
        SELECT cg.groupID, s.fileName, st.studentID, u.userID, CONCAT(u.firstName, ' ', u.lastName) AS name 
        FROM submission s 
        JOIN student st ON s.studentID = st.studentID 
        JOIN user u ON st.userID = u.userID 
        JOIN course_groups cg ON st.studentID = cg.studentID
        WHERE s.assignmentID = ?
        ORDER BY cg.groupID
    `;
    try {
        const rows = await query(sql, [assignmentID]);
        const groupsMap = new Map<number, { groupID: number, groupName: string, members: { studentID: number, userID: number, name: string, fileName: string }[] }>();

        rows.forEach((row: any) => {
            if (!groupsMap.has(row.groupID)) {
                groupsMap.set(row.groupID, { groupID: row.groupID, groupName: `Group ${row.groupID}`, members: [] });
            }

            const group = groupsMap.get(row.groupID);
            if (group) {
                group.members.push({ studentID: row.studentID, userID: row.userID, name: row.name, fileName: row.fileName });
            }
        });

        return Array.from(groupsMap.values());
    } catch (error) {
        console.error('Error in getSubmittedGroups:', error);
        throw error;
    }
}

async function getRemainingGroups(assignmentID: number): Promise<{ groupID: number, groupName: string, members: { studentID: number, name: string }[] }[]> {
    const sql = `
        SELECT cg.groupID, st.studentID, u.userID, CONCAT(u.firstName, ' ', u.lastName) AS name 
        FROM student st
        JOIN user u ON st.userID = u.userID
        JOIN course_groups cg ON st.studentID = cg.studentID
        LEFT JOIN submission s ON st.studentID = s.studentID AND s.assignmentID = ?
        WHERE s.submissionID IS NULL
        ORDER BY cg.groupID
    `;
    try {
        const rows = await query(sql, [assignmentID]);
        const groupsMap = new Map<number, { groupID: number, groupName: string, members: { studentID: number, userID: number, name: string }[] }>();

        rows.forEach((row: any) => {
            if (!groupsMap.has(row.groupID)) {
                groupsMap.set(row.groupID, { groupID: row.groupID, groupName: `Group ${row.groupID}`, members: [] });
            }

            const group = groupsMap.get(row.groupID);
            if (group) {
                group.members.push({ studentID: row.studentID, userID: row.userID, name: row.name });
            }
        });

        return Array.from(groupsMap.values());
    } catch (error) {
        console.error('Error in getRemainingGroups:', error);
        throw error;
    }
}
