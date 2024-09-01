// db.ts
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import config from './dbConfig'; // Import the database configuration from dbConfig.ts
import { JsonObject } from '@prisma/client/runtime/library';
import { randomizePeerReviewGroups } from './pages/api/addNew/randomizationAlgorithm';
import nodemailer from 'nodemailer';

let dbConfig;

if (process.env.NODE_ENV === 'production') {
  dbConfig = config.production;
} else if (process.env.NODE_ENV === 'development' && process.env.DEV_DB_HOST === '') {
  dbConfig = config.development;
} else if (process.env.NODE_ENV === 'development' && process.env.DEV_DB_HOST === 'db') {
  dbConfig = config.localhost;
} else {
  dbConfig = config.testing;
}

interface Group {
  groupNumber: number;
  studentIDs: number[];
}

export interface ReviewGroup {
  reviewee?: number;
  reviewers: number[];
}

// Use the production configuration if the NODE_ENV environment variable is set to 'production' but development config by default
const pool = mysql.createPool(dbConfig);

// main function to query the database with the given SQL query and values from pool
export async function query(sql: string, values: any[] = [], customPool: mysql.Pool = pool): Promise<any> {
  let connection: mysql.PoolConnection | undefined;
  try {
    connection = await customPool.getConnection();
    const [result] = await connection.execute(sql, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

/* CREATE FUNCTIONS - INSERT INTO TABLE */

// function to add a user to the database
export async function createUser(firstName: string, lastName: string, email: string, password: string, role: string) {
  const sql = `
    INSERT INTO user (firstName, lastName, email, pwd, userRole)
    VALUES (?, ?, ?, ?, ?)
  `;
  try {
    const result = await query(sql, [firstName, lastName, email, password, role]);
    return result.insertId; // Return the inserted user ID for adding to the instructor or student table
  } catch (error) {
    console.error('Error in addUser:', error); // Log the error
    throw error;
  }
}
// function to add a student to the database if the userRole is student
export async function createStudent(studentID: number, userID: number) {
  const sql = `
    INSERT INTO student (studentID, userID)
    VALUES (?, ?)
  `;
  try {
    await query(sql, [studentID, userID]);
  } catch (error) {
    console.error('Error in addStudent:', error); // Log the error
    throw error;
  }
}
// function to add an instructor to the database if the userRole is instructor
export async function createInstructor(instructorID: number, userID: number, isAdmin: boolean) {
  const sql = `
    INSERT INTO instructor (instructorID, userID, isAdmin)
    VALUES (?, ?, ?)
  `;
  try {
    await query(sql, [instructorID, userID, isAdmin]);
  } catch (error) {
    console.error('Error in addInstructor:', error); // Log the error
    throw error;
  }
}
// adds an assignment to the database for a course (called by createAssignment api)
export async function addAssignmentToCourse(
  title: string, 
  description: string, 
  startDate: string,
  endDate: string,
  dueDate: string, 
  file: string, 
  groupAssignment: boolean, 
  courseID: number,
  allowedFileTypes: string[]
) {
  if (!Number.isInteger(courseID)) {
    throw new Error('Invalid courseID');
  }
  const allowedFileTypesString = allowedFileTypes.join(',');
  const sql = `
    INSERT INTO assignment (title, descr, startDate, endDate, deadline, rubric, groupAssignment, courseID, allowedFileTypes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    // Check if the classID exists in the class table
    const classCheckSql = 'SELECT COUNT(*) as count FROM course WHERE courseID = ?';
    const classCheckResult = await query(classCheckSql, [courseID]);
    
    console.log('Class check result:', classCheckResult);

    if (!classCheckResult || !Array.isArray(classCheckResult) || classCheckResult.length === 0) {
      throw new Error(`Unexpected result when checking for class with ID ${courseID}`);
    }

    const count = classCheckResult[0].count;

    if (count === 0) {
      throw new Error(`No class found with ID ${courseID}`);
    }

    // If the class exists, proceed with the insert
    const insertResult = await query(sql, [title, description, new Date(startDate), new Date(endDate), new Date(dueDate), file, groupAssignment, courseID, allowedFileTypesString]);
    console.log('Insert result:', insertResult);

    return insertResult;
  } catch (error: any) {
    console.error('Error in addAssignmentToDatabase:', error);
    throw error;
  }
}
// Inserts a student into the selected_students table for the defined submission in a course. Adds to the review_groups table 
// for the selected student and submission (called by releaseRandomizedPeerReview api)
export async function selectStudentForSubmission(studentID: number, assignmentID: number, courseID: number, revieweeID: number): Promise<void> {

  const insertSql = `
    INSERT INTO review_groups (studentID, assignmentID, courseID, revieweeID)
    VALUES (?, ?, ?, ?)
  `;

  try {
    await query(insertSql, [studentID, assignmentID, courseID, revieweeID]);
  } catch (error) {
    const err = error as Error;
    console.error(`Error selecting student ${studentID} for assignment ${assignmentID}:`, err.message);
    throw err;
  }
}
// function to add a course to the database (called by createCourse api)
export async function createCourse(courseName: string, instructorID: number) {
  const sql = `
    INSERT INTO course (courseName, isArchived, instructorID)
    VALUES (?, false, ?)
  `;
  try {
    const result = await query(sql, [courseName, instructorID]);
    return result.insertId; // Return the inserted course ID
  } catch (error) {
    console.error('Error in createCourse:', error); // Log the error
    throw error;
  }
}
//  enroll student in a course (called by enrollStudents api)
export async function enrollStudent(userID: string, courseID: string, customPool: mysql.Pool = pool): Promise<void> {
  const sql = `
    INSERT INTO enrollment (studentID, courseID)
    VALUES (?, ?)
  `;
  try {
    const result = await query(sql, [userID, courseID], customPool);
  } catch (error) {
    const err = error as Error;
    console.error(`Error enrolling student ${userID} in course ${courseID}:`, err.message);
    throw err;
  }
}
// function to add a new submission to the database for an assignment
export async function submitAssignment(assignmentID: number, studentID: number, file: Express.Multer.File) {
  const sql = `
    INSERT INTO submission (assignmentID, studentID, fileName, fileContent, fileType, submissionDate)
    VALUES (?, ?, ?, ?, ?, NOW())
  `;

  try {
    const fileContent = await fs.readFile(file.path);
    const fileName = file.originalname;
    const fileType = file.mimetype;

    await query(sql, [assignmentID, studentID, fileName, fileContent, fileType]);

    // Delete the temporary file after it's been saved to the database
    await fs.unlink(file.path);

    return { success: true, message: 'Assignment submitted successfully' };
  } catch (error) {
    console.error('Error in submitAssignment:', error);
    throw error;
  }
}
// function to add a new feedback to the database for a submission (called by releaseAssignments api)
export async function createReview(
  assignmentID: number, 
  isGroupAssignment: boolean, 
  allowedFileTypes: string, 
  startDate: Date,
  endDate : Date,
  deadline: Date,
  anonymous: boolean
): Promise<void> {
  const result = await query(
    'INSERT INTO review (assignmentID, isGroupAssignment, allowedFileTypes,startDate, endDate, deadline, anonymous) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [assignmentID, isGroupAssignment, allowedFileTypes,startDate,endDate, deadline, anonymous]
  );
  
  if (result.affectedRows === 0) {
    throw new Error('Failed to create review');
  }
}
// function to add a new feedback criteria to the database for a submission (called by releaseAssignments api)
export async function addReviewCriteria(assignmentID: number, rubric: { criterion: string; maxMarks: number }[]): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    for (const item of rubric) {
      await query(
        'INSERT INTO review_criteria (assignmentID, criterion, maxMarks) VALUES (?, ?, ?)',
        [assignmentID, item.criterion, item.maxMarks]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
// adds a selected set of students to the selected_students table for a given assignment (called by selectStudentsForAssignment api)
export async function selectStudentsForAssignment(assignmentID: number, studentIDs: string[], uniqueDeadline: string | null): Promise<void> {
  const sql = `
    INSERT INTO selected_students (assignmentID, studentID, uniqueDeadline)
    VALUES (?, ?, ?)
  `;

  try {
    for (const studentID of studentIDs) {
      await query(sql, [assignmentID, Number(studentID), uniqueDeadline]);
    }
  } catch (error) {
    const err = error as Error;
    console.error(`Error selecting students for assignment:`, err.message);
  }
}
// creates a new group for set of students in a course and deletes all existing groups for the course
// (called by createGroups api)
export async function createGroups(groups: Group[] | null, courseID: number | null, customPool: mysql.Pool = pool) {
  const deleteSql = `
    DELETE FROM course_groups
    WHERE courseID = ?
  `;
  const insertSql = `
    INSERT INTO course_groups (groupID, studentID, courseID)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE studentID = VALUES(studentID)
  `;

  if (!groups || !courseID) {
    throw new Error('Invalid input');
  }

  try {
    // Delete all existing groups for the course
    await query(deleteSql, [courseID], customPool);

    // Insert the new groups
    for (const group of groups) {
      for (const studentID of group.studentIDs) {
        await query(insertSql, [group.groupNumber, studentID, courseID], customPool);
      }
    }
  } catch (error) {
    console.error('Error creating groups:', error);
    throw error;
  }
}
// Added these new functions for the peer review form for instrcutor

// export async function addReviewCriteria(assignmentID: number, criteria: { criterion: string; maxMarks: number }[]) {
//   const sql = `
//     INSERT INTO review_criteria (assignmentID, criterion, maxMarks)
//     VALUES (?, ?, ?)
//   `;

//   try {
//     for (const item of criteria) {
//       await query(sql, [assignmentID, item.criterion, item.maxMarks]);
//     }
//   } catch (error) {
//     console.error('Error adding review criteria:', error);
//     throw error;
//   }
// }

/* BASIC GETTER FUNCTIONS - GENERIC SELECT FROM TABLE USING PK  */

//Gets course by ID instead of instructorID
export async function getCourse(courseID: number): Promise<any> { 
  const sql = `
    SELECT courseID, courseName, instructorID  FROM course WHERE courseID = ?  `;
  try {
    const rows = await query(sql, [courseID]);
    return rows[0];
  } catch (error) {
    console.error('Error in getCourse:', error);
    throw error;
  }
}
//Gets instructor from the userID
export async function getInstructor(userID: number): Promise<number> {
  const sql = `
    SELECT *
    FROM instructor
    WHERE userID = ?
  `;
  try {
    const result = await query(sql, [userID]);
    if (result.length > 0) {
      return result[0].instructorID;
    } else {
      throw new Error('No instructor found with the provided userID');
    }
  } catch (error) {
    console.error('Error in getInstructorIDFromUserID:', error);
    throw error;
  }
}
// gets review criteria for a given assignment
export async function getReviewCriteria(assignmentID: number) {
  const sql = `
    SELECT criteriaID, criterion, maxMarks
    FROM review_criteria
    WHERE assignmentID = ?
  `;

  try {
    const rows = await query(sql, [assignmentID]);
    return rows;
  } catch (error) {
    console.error('Error getting review criteria:', error);
    throw error;
  }
}
// grab student from the database matching their student ID not user ID or name
export async function getStudent(studentID: number, customPool: mysql.Pool = pool) {
  const sql = `
    SELECT * FROM student WHERE studentID = ?
  `;
  try {
    const rows = await query(sql, [studentID], customPool);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null; // Return null if no student is found
    }
  } catch (error) {
    console.error('Error in getStudent:', error);
    throw error;
  }
}
// gets the user from the database matching the user ID
export async function getUser(userID: string): Promise<any> {
  const sql = `SELECT * FROM user WHERE userID = ?`;

  try {
    const rows = await query(sql, [userID]);
    if (rows.length > 0) {
      return rows[0];
    }
    return null; // Return null if no user is found (update later)
  } catch (error) {
    console.error(`Error fetching user ${userID}:`, error);
    throw error;
  }
}
// gets review details for a given assignment
export async function getReview(assignmentID: number) {
  const sql = `
    SELECT *
    FROM review
    WHERE assignmentID = ?
  `;

  try {
    const rows = await query(sql, [assignmentID]);
    return rows;
  } catch (error) {
    console.error('Error getting review:', error);
    throw error;
  }
}
// gets submission details for a given submissionID
export async function getSubmission(submissionID: number) {
  const sql = `
    SELECT *
    FROM submission
    WHERE submissionID = ?
  `;

  try {
    const rows = await query(sql, [submissionID]);
    return rows;
  } catch (error) {
    console.error('Error getting submission:', error);
    throw error;
  }
}
// gets assignment details for a given assignmentID
export async function getAssignment(assignmentID: number) {
  const sql = `
    SELECT *
    FROM assignment
    WHERE assignmentID = ?
  `;

  try {
    const rows = await query(sql, [assignmentID]);
    return rows;
  } catch (error) {
    console.error('Error getting assignment:', error);
    throw error;
  }
}
// gets feedback details for a given submissionID
export async function getFeedback(submissionID: number) {
  const sql = `
    SELECT *
    FROM feedback
    WHERE assignmentID = ?
  `;

  try {
    const rows = await query(sql, [submissionID]);
    return rows[0];
  } catch (error) {
    console.error('Error getting feedback:', error);
    throw error;
  }
}
// Function to get group feedback details
export async function getGroupFeedback(assignmentID: number, reviewerID: number, revieweeID: number) {
  const sql = `
    SELECT *
    FROM group_feedback
    WHERE assignmentID = ? AND reviewerID = ? AND revieweeID = ?
  `;

  try {
    const rows = await query(sql, [assignmentID, reviewerID, revieweeID]);
    return rows[0];
  } catch (error) {
    console.error('Error getting group feedback:', error);
    throw error;
  }
}
// gets student enrollment for a given studentID and courseID (checks if student is enrolled in a course)
export async function getEnrollment(studentID: number, courseID: number) {
  const sql = `
    SELECT *
    FROM enrollment
    WHERE studentID = ? AND courseID = ?
  `;

  try {
    const rows = await query(sql, [studentID, courseID]);
    return rows[0];
  } catch (error) {
    console.error('Error getting enrollment:', error);
    throw error;
  }
}
// Get review groups for a student based on the provided parameters (called by group(s)/[assignmentID] api)
export async function getReviewGroups(studentID?: number, assignmentID?: number, revieweeID?: number, groupBy?: string) {
  const conditions = [];
  const params = [];

  if (studentID !== undefined) {
    conditions.push('studentID = ?');
    params.push(studentID);
  }

  if (assignmentID !== undefined) {
    conditions.push('assignmentID = ?');
    params.push(assignmentID);
  }

  if (revieweeID !== undefined) {
    conditions.push('revieweeID = ?');
    params.push(revieweeID);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const groupByClause = groupBy ? `GROUP BY ${groupBy}` : '';

  const sql = `
    SELECT revieweeID, GROUP_CONCAT(studentID) AS reviewerIDs
    FROM review_groups
    ${whereClause}
    ${groupByClause}
  `;
  
  try {
    const rows = await query(sql, params);
    return rows.map((row: { revieweeID: any; reviewerIDs: string; }) => ({
      revieweeID: row.revieweeID,
      reviewerIDs: row.reviewerIDs ? row.reviewerIDs.split(',').map(Number) : []
    }));
  } catch (error) {
    console.error('Error fetching review groups:', error);
    throw error;
  }
}
// gets student details to be displayed in their review groups
export async function getStudentDetails(studentIDs: number[]) {
  // Create placeholders for each studentID
  const placeholders = studentIDs.map(() => '?').join(',');

  const sql = `
    SELECT student.studentID, firstName, lastName
    FROM student
    JOIN user ON student.userID = user.userID
    WHERE student.studentID IN (${placeholders})
  `;

  const students = await query(sql, studentIDs);

  // Transform the result into an object with student IDs as keys for easy lookup
  const studentDetails: { [key: number]: { studentID: number, firstName: string, lastName: string } } = {};
  students.forEach((student: { studentID: number, firstName: string, lastName: string }) => {
    studentDetails[student.studentID] = {
      studentID: student.studentID,
      firstName: student.firstName,
      lastName: student.lastName
    };
  });
  return studentDetails;
}


/* GET ALL IN TABLE FUNCTIONS - NO PARAMS */

// gets all courses from the database (called by getAllCourses api)
export async function getCourses(): Promise<any[]> {
  const sql = 'SELECT * FROM course';
  try {
    const rows = await query(sql);
    return rows as any[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
// gets all assignments from the database
export async function getAssignments(): Promise<any[]> {
  const sql = 'SELECT assignmentID, title, descr, DATE_FORMAT(deadline, "%Y-%m-%dT%H:%i:%s.000Z") as deadline FROM assignment';
  try {
    const rows = await query(sql);
    console.log('Fetched assignments:', rows);
    return rows as any[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
// gets all assignment submissions from the database via complex join (called by getAssignmentsWithSubmissions api)
export async function getAssignmentsWithSubmissions() {
  const sql = `
    SELECT 
      a.assignmentID, 
      a.title, 
      a.descr as description, 
      DATE_FORMAT(a.deadline, '%Y-%m-%dT%H:%i:%s.000Z') as deadline,
      a.rubric,
      a.file,
      s.studentID,
      DATE_FORMAT(s.submissionDate, '%Y-%m-%dT%H:%i:%s.000Z') as submissionDate,
      s.file as submissionFile
    FROM 
      assignment a
    LEFT JOIN 
      submissions s ON a.assignmentID = s.assignmentID
  `;
  try {
    const rows = await query(sql);
    
    // Group submissions by assignment
    const assignments = rows.reduce((acc: any[], row: any) => {
      const assignment = acc.find((a: { assignmentID: any; }) => a.assignmentID === row.assignmentID);
      if (assignment) {
        if (row.studentID) {
          assignment.submissions.push({
            studentID: row.studentID,
            submissionDate: row.submissionDate,
            file: row.submissionFile
          });
        }
      } else {
        acc.push({
          assignmentID: row.assignmentID,
          title: row.title,
          description: row.description,
          deadline: row.deadline,
          rubric: row.rubric,
          file: row.file,
          submissions: row.studentID ? [{
            studentID: row.studentID,
            submissionDate: row.submissionDate,
            file: row.submissionFile
          }] : []
        });
      }
      return acc;
    }, []);

    return assignments;
  } catch (error) {
    console.error('Error in getAssignmentsWithSubmissions:', error);
  }
}

/* ALTERNATE GET FUNCTIONS - QUERY TABLES BY SELECT VALUE */

// gets instructorID from the userID  (called by createCourse api)
export async function getInstructorID(userID: number): Promise<number | null> {
  if (typeof userID !== 'number' || isNaN(userID)) {
    throw new Error(`Invalid userID: ${userID}`);
  }
  const sql = 'SELECT instructorID FROM instructor WHERE userID = ?';
  try {
    const rows = await query(sql, [userID]);
    if (rows.length === 0) {
      return null; // No instructor found for this userID
    }
    return rows[0].instructorID;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
// gets courses for an instructor with username based on archived status (called by getAllArchivedCourses api)
export async function getAllCourses(isArchived: boolean): Promise<any[]> {
  const sql = `
    SELECT 
      course.courseID,
      course.courseName,
      user.firstName AS instructorFirstName,
      user.lastName AS instructorLastName,
      COALESCE(AVG(submission.grade), 0) AS averageGrade
    FROM course
    JOIN instructor ON course.instructorID = instructor.instructorID
    JOIN user ON instructor.userID = user.userID
    LEFT JOIN assignment ON course.courseID = assignment.courseID
    LEFT JOIN submission ON assignment.assignmentID = submission.assignmentID
    WHERE course.isArchived = ?
    GROUP BY course.courseID, user.userID
  `;
  try {
    const rows = await query(sql, [isArchived]);
    return rows.map((row: any) => ({
      ...row,
      averageGrade: row.averageGrade !== null ? parseFloat(row.averageGrade) : null,
    }));
  } catch (error) {
    console.error('Error in getAllCourses:', error); // Log the error
    throw error;
  }
}
// gets all assignments for a student based on the userID via join tables (called by getAllAssignmentsStudent api)
export async function getAllAssignmentsStudent(userID: number) {
  const sql = `
    SELECT a.*
FROM assignment a
JOIN course c ON a.courseID = c.courseID
JOIN enrollment e ON c.courseID = e.courseID
JOIN student s ON e.studentID = s.studentID
JOIN user u ON s.userID = u.userID
WHERE u.userID = ?;
  `;
  try {
    const results = await query(sql, [userID]);
    return results;
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    throw error;
  }
}
// gets all assignments for an instructor based on the userID via join tables (called by getAllAssignmentsInstructor api)
export async function getAllAssignmentsInstructor(userID: number) {
  const sql = `
    SELECT a.*, c.courseName
FROM assignment a
JOIN course c ON a.courseID = c.courseID
JOIN instructor i ON c.instructorID = i.instructorID
JOIN user u ON i.userID = u.userID
WHERE u.userID = ?;
  `;
  try {
    const results = await query(sql, [userID]);
    return results;
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    throw error;
  }
}
// gets all student submissions for an assignment based on the assignmentID returned as an array object (called by getSumbissionList and [assignmentID] apis)
export async function getStudentSubmissions(assignmentId: number): Promise<Array<{ submissionID: number; studentID: number }>> {
  const sql = `
    SELECT studentID, submissionID
    FROM submission
    WHERE assignmentID = ?
  `;
  try {
    const results = await query(sql, [assignmentId]);
    console.log('Fetched student submissions:', results);
    return results;
  } catch (error) {
    console.error('Error in getSubmissionsByAssignmentId:', error);
    throw error;
  }
}
// gets all courses for a particular student based on the studentID
export async function getCoursesByStudentID(studentID: number): Promise<any[]> {
  const sql = `SELECT c.courseID, c.courseName, u.firstName AS instructorFirstName
FROM enrollment e
JOIN course c ON e.courseID = c.courseID
JOIN instructor i ON c.instructorID = i.instructorID
JOIN user u ON i.userID = u.userID
WHERE e.studentID = ?
ORDER BY c.courseID`;
  try {
    console.log('Fetching courses for student:', studentID);
    const rows = await query(sql, [studentID]);
    return rows;
  } catch (error) {
    console.error('Error fetching courses for student:', error);
    throw error;
  }
}
// I'm pretty sure this is just getAssignment for a given assignmentID
export async function getAssignmentForStudentView(assignmentId: number) {
  const sql = `
    SELECT 
      assignmentID, 
      title, 
      descr, 
      DATE_FORMAT(deadline, '%Y-%m-%dT%H:%i:%s.000Z') as deadline,
      rubric,
      groupAssignment,
      courseID,
      allowedFileTypes
    FROM assignment 
    WHERE assignmentID = ?
  `;
  try {
    const rows = await query(sql, [assignmentId]);
    if (rows.length === 0) {
      return null;
    }
    const assignment = rows[0];
    assignment.allowedFileTypes = assignment.allowedFileTypes ? assignment.allowedFileTypes.split(',') : [];
    return assignment;
  } catch (error) {
    console.error('Error in getAssignmentForStudentView:', error);
    throw error;
  }
}
// gets submission file details for a submissionID
export async function getSubmissionFile(submissionID: number) {
  const sql = `
    SELECT fileName, fileContent, fileType
    FROM submission
    WHERE submissionID = ?
  `;

  try {
    const rows = await query(sql, [submissionID]);
    if (rows.length === 0) {
      throw new Error('Submission not found');
    }

    const { fileName, fileContent, fileType } = rows[0];
    return { fileName, fileContent, fileType };
  } catch (error) {
    console.error('Error in getSubmissionFile:', error);
    throw error;
  }
}
// grab all students from the database matching the first and last name
export async function getStudentsByName(firstName:string, lastName:string) {
  const sql = `
    SELECT user.*, student.studentID FROM user JOIN student ON user.userID = student.userID WHERE user.firstName = ? AND user.lastName = ? AND user.userRole = 'student'
  `;
  try {
    const rows = await query(sql, [firstName, lastName]);
    if (rows.length > 0) {
      return rows[0];
    } else {
      return null; // Return null if no student is found
    }
  } catch (error) {
    console.error('Error in getStudents:', error);
    throw error;
  }
}
// grab all students from the database matching their user ID's (called by getStudentsByID api)
export async function getStudentsById(userID: number, customPool: mysql.Pool = pool) {
    const sql = `
      SELECT studentID, u.userID FROM student s JOIN user u ON s.userID = u.userID WHERE u.userID = ?
    `;
    try {
      const rows = await query(sql, [userID], customPool);
      if (rows.length > 0) {
        return rows[0];
      } else {
        return null; // Return null if no student is found
      }
    } catch (error) {
      console.error('Error in getStudents:', error);
      throw error;
    }
}
// gets all students enrolled in a course based on the courseID (called by getCourseList api)
export async function getStudentsInCourse(courseID: number): Promise<any[]> {
const sql = `
  SELECT u.userID, u.firstName, u.lastName, u.email, s.studentID
  FROM user u
  JOIN student s ON u.userID = s.userID
  JOIN enrollment e ON s.studentID = e.studentID
  WHERE u.userRole = 'student' AND e.courseID = ?
  ORDER BY u.lastName, u.firstName
`;

try {
  const rows = await query(sql, [courseID]);
  return rows;
} catch (error) {
  console.error('Error fetching students:', error);
  throw error;
}
}
// gets all students in a course by group based on the courseID (called by getCourseGroups api)
export async function getCourseGroups(courseID: number, customPool: mysql.Pool = pool): Promise<any[]> {
  if (!courseID) {
    throw new Error('Invalid course ID');
  }

  const sql = `
    SELECT *
    FROM course_groups
    WHERE courseID = ?
    ORDER BY groupID, studentID
  `;

  try {
    const rows = await query(sql, [courseID], customPool);
    return rows;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
}

/* AUTHENTICATION FUNCTIONS */

export async function authenticateAdmin(email: string, password: string): Promise<boolean> {
  const sql = `
    SELECT u.* 
    FROM user u
    JOIN instructor i ON u.userID = i.userID
    WHERE u.email = ? AND u.pwd = ? AND u.userRole = 'instructor' AND i.isAdmin = true
  `;
  try {
    const rows = await query(sql, [email, password]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error in authenticateAdmin:', error); // Log the error
    throw error;
  }
}

export async function authenticateInstructor(email: string, password: string): Promise<boolean> {
  const sql = `
    SELECT * FROM user WHERE email = ? AND pwd = ? AND userRole = 'instructor'
  `;
  try {
    const rows = await query(sql, [email, password]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error in authenticateInstructor:', error); // Log the error
    throw error;
  }
}

export async function authenticateStudent(email: string, password: string): Promise<boolean> {
  const sql = `
    SELECT * FROM user WHERE email = ? AND pwd = ? AND userRole = 'student'
  `;
  try {
    const rows = await query(sql, [email, password]);
    return rows.length > 0;
  } catch (error) {
    console.error('Error in authenticateStudent:', error); // Log the error
    throw error;
  }
}

/* UPDATE FUNCTIONS - MAIN HANDLERS */

// Update the assignment options for a given assignmentID
export async function updateAssignment(assignmentID: number, isGroupAssignment: boolean, allowedFileTypes: string,  startDate: string,endDate: string,dueDate: string): Promise<any[]> {
  const sql = `
    UPDATE assignment
    SET groupAssignment = ?, allowedFileTypes = ?, startDate = ?, endDate = ?, deadline =?
    WHERE assignmentID = ?
  `;

  try {
    const newAssign = await query(sql, [isGroupAssignment, allowedFileTypes, startDate, endDate, dueDate, assignmentID]);
    return newAssign;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
}
// Update the Assignment Name or Description for a given assignmentID
export async function updateAssignmentName(assignmentID: string, title?: string, description?: string): Promise<any> {
  const updateFields = [];
  const params = [];

  if (title !== undefined) { updateFields.push('title = ?'); params.push(title); }
  if (description !== undefined) { updateFields.push('descr = ?'); params.push(description); }

  const sql = `UPDATE assignment SET ${updateFields.join(', ')} WHERE assignmentID = ?`;

  try {
    // Check if the assignment already exists with the given values
    const existingAssignment = await getAssignment(Number(assignmentID));
    if (!existingAssignment) {
      throw new Error(`Assignment with ID ${assignmentID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, assignmentID]);
    return update;
  } catch (error) {
    console.error(`Error updating assignment ${assignmentID}:`, error);
    throw error;
  }
}
// Updates the assignment for a student to review with given submissionID and assignmentID checks if the record exists before updating groups
export async function updateReviewer(studentID: number, assignmentID: number, submissionID: number): Promise<void> {
  // Assuming getReviewGroups is imported or available in this context
  // and it returns an array of existing records based on the provided parameters

  // Update SQL template
  const updateSql = `
    UPDATE review_groups
    SET ${assignmentID ? 'assignmentID = ?' : ''}${assignmentID && submissionID ? ', ' : ''}${submissionID ? 'submissionID = ?' : ''}
    WHERE studentID = ?
  `;

  // Parameters for the update query
  const updateParams = [...(assignmentID ? [assignmentID] : []), ...(submissionID ? [submissionID] : []), studentID];

  try {
    // Use getReviewGroups to check if the record exists
    const existingRecords = await getReviewGroups(studentID, assignmentID, submissionID);
    if (existingRecords.length > 0) {
      console.log(`The studentID ${studentID} with assignmentID ${assignmentID} or submissionID ${submissionID} already exists.`);
      return; // Skip update if exists
    }

    // Proceed with update if not exists
    await query(updateSql, updateParams);
    console.log(`Updated studentID ${studentID} with new assignmentID ${assignmentID} or new submissionID ${submissionID}.`);
  } catch (error) {
    const err = error as Error;
    console.error(`Error updating student ${studentID}:`, err.message);
    throw err;
  }
}
export async function updateReviewGroups(assignmentID: number, courseID: number, groups: ReviewGroup[], reviewsPerAssignment: number, randomize: boolean) {
  if (randomize) {
    // Fetch all students in the course
    const studentsResult = await getStudentsInCourse(courseID);

    if (studentsResult.length === 0) {
      throw new Error('No students found for the course');
    }

    const students = studentsResult.map((row) => ({
      studentID: row.studentID,
    }));

    // Randomize review groups
    groups = randomizePeerReviewGroups(students, reviewsPerAssignment);
  }

  // Clear existing review groups for the assignment
  const deleteQuery = 'DELETE FROM review_groups WHERE assignmentID = ?';
  await query(deleteQuery, [assignmentID]);

  // Insert new review groups into the database
  const insertQuery = `
    INSERT INTO review_groups (studentID, assignmentID, courseID, revieweeID, isReleased)
    VALUES (?, ?, ?, ?, false)
  `;

  for (const group of groups) {
    for (const reviewer of group.reviewers) {
      await query(insertQuery, [reviewer, assignmentID, courseID, group.revieweeID ?? null]);
    }
  }

  return { message: 'Review groups updated successfully' };
}
/*
UPDATE USER QUERIES FOR EACH TABLE (Instructor unnecessary)
*/
// Update user information in the database with the given values
export async function updateUser(userID: string, firstName?: string, lastName?: string, email?: string, password?: string): Promise<any> {
  const updateFields = [];
  const params = [];

  if (firstName !== undefined) { updateFields.push('firstName = ?'); params.push(firstName); }
  if (lastName !== undefined) { updateFields.push('lastName = ?'); params.push(lastName); }
  if (email !== undefined) { updateFields.push('email = ?'); params.push(email); }
  if (password !== undefined) { updateFields.push('password = ?'); params.push(password); }

  const sql = `UPDATE user SET ${updateFields.join(', ')} WHERE userID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingUser = await getUser(userID);
    if (!existingUser) {
      throw new Error(`User with ID ${userID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, userID]);
    return update;
  } catch (error) {
    console.error(`Error updating user ${userID}:`, error);
    throw error;
  }
}
// Update student information in the database with the given values
export async function updateStudent(sID: string, uID: string, pNum?: string, address?: string, dob?: string): Promise<any> {
  const updateFields = [];
  const params = [];

  if ( pNum!== undefined) { updateFields.push('phoneNumber = ?'); params.push(pNum); }
  if (address !== undefined) { updateFields.push('homeAddress = ?'); params.push(address); }
  if (dob !== undefined) { updateFields.push('dateOfBirth = ?'); params.push(dob); }

  const sql = `UPDATE student SET ${updateFields.join(', ')} WHERE studentID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingUser = await getStudentsById(Number(uID));
    if (!existingUser) {
      throw new Error(`Student ${sID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, sID]);
    return update;
  } catch (error) {
    console.error(`Error updating student ${sID}:`, error);
    throw error;
  }
}
// Update course information in the database with the given values
export async function updateCourse(courseID: string, courseName?: string, instructorID?: string): Promise<any> {
  const updateFields = [];
  const params = [];

  if (courseName !== undefined) { updateFields.push('courseName = ?'); params.push(courseName); }
  if (instructorID !== undefined) { updateFields.push('instructorID = ?'); params.push(instructorID); }

  const sql = `UPDATE course SET ${updateFields.join(', ')} WHERE courseID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingCourse = await getCourse(Number(courseID));
    if (!existingCourse) {
      throw new Error(`Course with ID ${courseID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, courseID]);
    return update;
  } catch (error) {
    console.error(`Error updating course ${courseID}:`, error);
    throw error;
  }
}
// Update student submission information in the database with the given values
export async function updateSubmission(submissionID: string, assignmentID?: string, studentID?: string, fname?: string, fcontent?: JsonObject, fType?: string, subDate?: string, autoGrade?: string, grade?: string)
: Promise<any> {
  /**This function might need to be handled differently for several things, such as file uploads, 
  or the fact of storing each submission compared to just updating it as the same submission */
  const updateFields = [];
  const params = [];

  if (assignmentID !== undefined) { updateFields.push('assignmentID = ?'); params.push(assignmentID); }
  if (studentID !== undefined) { updateFields.push('studentID = ?'); params.push(studentID); }
  if (fname !== undefined) { updateFields.push('fileName = ?'); params.push(fname); }
  if (fcontent !== undefined) { updateFields.push('fileContent = ?'); params.push(fcontent); }
  if (fType !== undefined) { updateFields.push('fileType = ?'); params.push(fType); }
  if (subDate !== undefined) { updateFields.push('submissionDate = ?'); params.push(subDate); }
  if (grade !== undefined) { updateFields.push('grade = ?'); params.push(grade); }
  if (autoGrade !== undefined) { updateFields.push('autoGrade = ?'); params.push(autoGrade); }

  const sql = `UPDATE submission SET ${updateFields.join(', ')} WHERE submissionID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingSubmission = await getSubmissionFile(Number(submissionID)); //This might need to be changed
    if (!existingSubmission) {
      throw new Error(`Submission with ID ${submissionID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, submissionID]);
    return update;
  } catch (error) {
    console.error(`Error updating submission ${submissionID}:`, error);
    throw error;
  }
}
// Update enrollment information in the database with the given values
export async function updateEnrollment(studentID: string, courseID: string): Promise<any> {

  const sql = `UPDATE enrollment SET studentID = ?, courseID = ? WHERE studentID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingEnrollment = await getEnrollment(Number(studentID), Number(courseID));
    if (!existingEnrollment) {
      throw new Error(`Enrollment with ID ${studentID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [studentID, courseID]);
    return update;
  } catch (error) {
    console.error(`Error updating enrollment. Student ${studentID} cant be moved to course ${courseID}:`, error);
    throw error;
  }
}
// Update review information in the database with the given values (Criteria)
export async function updateReviewCriteria(assignmentID: number, criterion?: string, maxMarks?: number): Promise<void> {
  const updateFields = [];
  const params = [];

  if (criterion !== undefined) { updateFields.push('criterion = ?'); params.push(criterion); }
  if (maxMarks !== undefined) { updateFields.push('maxMarks = ?'); params.push(maxMarks); }

  const sql = `UPDATE review_criteria SET ${updateFields.join(', ')} WHERE criteriaID = ?`;

  try {
    // Check if the user already exists with the given values
    const currCriteria = await getReviewCriteria(Number(assignmentID));
    if (!currCriteria) {
      throw new Error(`Review Criteria for the assignment ${assignmentID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [...params, currCriteria.criteriaID]);
    return update;
  } catch (error) {
    console.error(`Error updating criteria for assignment: ${assignmentID}:`, error);
    throw error;
  }
}

//Update review
export async function updateReview(reviewID: number, assignmentID: number, isGroupAssignment: boolean, allowedFileTypes: string, startDate: string, endDate: string, deadline: string, anonymous: boolean): Promise<any[]> {
  const sql = `
    UPDATE review
    SET assignmentID = ?, isGroupAssignment = ?, allowedFileTypes = ?, startDate = ?, endDate = ?, deadline = ?, anonymous = ?
    WHERE reviewID = ?
  `;

  try {
    const updatedReview = await query(sql, [assignmentID, isGroupAssignment, allowedFileTypes, startDate, endDate, deadline, anonymous, reviewID]);
    return updatedReview;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}
export async function updateReviewDates(reviewID: number, startDate: string, endDate: string, deadline: string, anonymous: Boolean): Promise<any> {
  const sql = `
    UPDATE review
    SET startDate = ?, endDate = ?, deadline = ?, anonymous = ?
    WHERE reviewID = ?
  `;

  try {
    const result = await query(sql, [startDate, endDate, deadline, anonymous, reviewID]);
    return result;
  } catch (error) {
    console.error('Error updating review dates:', error);
    throw error;
  }
}

//Update isReleased when startDate = NOW() --> for auto-releaseing an assignment
export async function autoRelease(assignmentID: number) {
  try {
    // Release the reviews
    await query('UPDATE review_groups SET isReleased = TRUE WHERE assignmentID = ?', [assignmentID]);

    // Fetch assignment and course details
    const [assignment] = await query('SELECT title AS assignmentName, courseID FROM assignment WHERE assignmentID = ?', [assignmentID]);
    const [course] = await query('SELECT courseName FROM course WHERE courseID = ?', [assignment.courseID]);

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
                </div>
              </div>`
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${student.email}`);
      } catch (error) {
        console.error(`Error sending email to ${student.email}:`, error);
      }
    }

    console.log(`Assignment ${assignmentID} auto-released successfully and emails sent`);
  } catch (error) {
    console.error(`Failed to auto-release assignment ${assignmentID}:`, error);
  }
}


// Update student feedback information in the database (Feedback) - assignmentID is submission and reviewerID is studentID of reviewer
export async function updateFeedback(assignmentID: string, studentID: string, content: string): Promise<any> {

  const sql = `UPDATE feedback SET content = ? WHERE feedbackID = ? AND reviewerID = ?`;

  try {
    // Check if the user already exists with the given values
    const existingFeedback = await getFeedback(Number(assignmentID));
    if (!existingFeedback) {
      throw new Error(`Feedback for submission ${assignmentID} does not exist.`);
    }
    // Proceed with the update
    const update = await query(sql, [content, existingFeedback.feedbackID, studentID]);
    return update;
  } catch (error) {
    console.error(`Error updating feedback ${assignmentID} for user ${studentID}:`, error);
    throw error;
  }
}
// Update student feedback information in the database (Feedback) - assignmentID is submission and reviewerID is studentID of reviewer
export async function updateGroupFeedback(assignmentID: string, content: string, score: string, reviewerID: string, revieweeID: string): Promise<any> {

  const sql = `UPDATE group_feedback SET content = ?, score = ? WHERE assignmentID = ? AND reviewerID = ? AND revieweeID = ?`;

  try {
    let reviewerStudentID = await getStudentsById(Number(reviewerID));
    reviewerStudentID = reviewerStudentID.studentID;

    // Check if the user already exists with the given values
    const existingFeedback = await getGroupFeedback(Number(assignmentID), Number(reviewerStudentID), Number(revieweeID));

    if (!existingFeedback) {
      throw new Error(`Feedback for submission ${assignmentID} does not exist between user ${reviewerID} and ${revieweeID}.`);
    }
    // Proceed with the update
    const update = await query(sql, [content, Number(score), Number(assignmentID), Number(reviewerStudentID), Number(revieweeID)]);
    return update;
  } catch (error) {
    console.error(`Error updating feedback ${assignmentID} between user ${reviewerID} and ${revieweeID}:`, error);
    throw error;
  }
};

export async function addStudentNotification(studentID: number, customPool: mysql.Pool = pool): Promise<any[]> {
  if (!studentID) {
    throw new Error('Invalid studentID');
  }
  const insertSql = `
  INSERT INTO student_notifications (studentID)
  VALUES (?)
`;
  try {
    const rows = await query(insertSql, [studentID], customPool);
    return rows;
  } catch (error) {
    console.error('Error adding student to notifications:', error);
    throw error;
  }
}

export async function updateStudentNotifications(userID: any, assignmentNotification: any, reviewNotification: any) {
  const result = await query(
    `UPDATE student_notifications sn
    JOIN student s ON sn.studentID = s.studentID
    SET sn.assignmentNotification = ?, sn.reviewNotification = ?
    WHERE s.userID = ?;
    `,
    [assignmentNotification, reviewNotification, userID]
  );
  return result;
}

/* DELETE FUNCTIONS */



// export async function submitAssignment(assignmentID: number, studentID: number, file: Buffer) {
//   const sql = `
//     INSERT INTO submissions (assignmentID, studentID, submissionDate, file)
//     VALUES (?, ?, NOW(), ?)
//   `;
//   try {
//     await query(sql, [assignmentID, studentID, file]);
//   } catch (error) {
//     console.error('Error in submitAssignment:', error);
//     throw error;
//   }
// }
// 
// export async function submitAssignment(assignmentID: number, studentID: number, file: Express.Multer.File) {
//   const sql = `
//     INSERT INTO submission (assignmentID, studentID, fileName, fileContent, fileType, submissionDate)
//     VALUES (?, ?, ?, ?, ?, NOW())
//   `;

//   try {
//     const fileContent = await fs.readFile(file.path);
//     const fileName = file.originalname;
//     const fileType = file.mimetype;

//     await query(sql, [assignmentID, studentID, fileName, fileContent, fileType]);

//     // Delete the temporary file after it's been saved to the database
//     await fs.unlink(file.path);

//     return { success: true, message: 'Assignment submitted successfully' };
//   } catch (error) {
//     console.error('Error in submitAssignment:', error);
//     throw error;
//   }
// }
// export async function setUniqueDueDates(assignmentID: number, studentIDs: number[], dueDate: string) {
//   try {
//     const connection = await pool.getConnection();

//     for (const studentID of studentIDs) {
//       await connection.execute(
//         'INSERT INTO unique_due_dates (assignmentID, studentID, uniqueDeadline) VALUES (?, ?, ?) ' +
//         'ON DUPLICATE KEY UPDATE uniqueDeadline = ?',
//         [assignmentID, studentID, dueDate, dueDate]
//       );
//     }

//     connection.release();
//     return { message: 'Unique due dates set successfully' };
//   } catch (error) {
//     console.error('Error setting unique due dates:', error);
//     throw error;
//   }
// }
/* EXTRA FUNCTIONS */
//Get students for setting unique due date
// export async function getStudents(): Promise<any[]> {
//   const sql = `
//     SELECT u.userID, u.firstName, u.lastName, u.email, s.studentID
//     FROM user u
//     JOIN student s ON u.userID = s.userID
//     WHERE u.userRole = 'student'
//     ORDER BY u.lastName, u.firstName
//   `;

//   try {
//     const rows = await query(sql);
//     return rows;
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     throw error;
//   }
// }
// export async function getStudents(userId: string) {
//   const sql = `
//     SELECT * FROM student WHERE userID = ?
//   `;
//   try {
//     const rows = await query(sql, [userId]);
//     if (rows.length > 0) {
//       return rows[0];
//     }
//   } catch (error) {
//     console.error('Error in getStudents:', error);
//     throw error;
//   }
// }
// export async function assignStudent(userID: string, assignmentID: string): Promise<void> {
//   const sql = `
//     UPDATE assignment SET studentID = ? WHERE assignmentID = ?
//   `;
//   try {
//     const result = await query(sql, [userID, assignmentID]);
//   } catch (error) {
//     const err = error as Error;
//     console.error(`Error adding student ${userID} to assignment ${assignmentID}:`, err.message);
//     throw err;
//   }
// }
