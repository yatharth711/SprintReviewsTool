// tests-jest/enrollStudent.test.ts
import mysql from 'mysql2/promise';
import { enrollStudent } from '../../src/db';

describe('enrollStudent Tests', () => {
  let connection: mysql.PoolConnection;
  // Since multiple tests are being run, use a baseID to ensure unique IDs
  // then only test for getting these specific courses
  const uniqueID = Math.floor(Math.random() * 1000000); // Base value for unique IDs

  beforeAll(async () => {
    connection = await global.pool.getConnection();

    // Ensure the user exists for both student and instructor
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES 
      (${uniqueID + 1}, 'Test', 'Student', 'test.student@example.com', 'password123', 'student'),
      (${uniqueID + 2}, 'Test', 'Instructor', 'test.instructor@example.com', 'password123', 'instructor')
      ON DUPLICATE KEY UPDATE email = VALUES(email)`
    );

    // Ensure the student exists
    await connection.query(
      `INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES 
      (${uniqueID + 1}, ${uniqueID + 1}, '1234567890', '123 Test St', '2000-01-01')
      ON DUPLICATE KEY UPDATE phoneNumber = '1234567890'`
    );

    // Ensure the instructor exists
    await connection.query(
      `INSERT INTO instructor (instructorID, userID, isAdmin, departments) VALUES 
      (${uniqueID + 2}, ${uniqueID + 2}, TRUE, 'Test Department')
      ON DUPLICATE KEY UPDATE departments = 'Test Department'`
    );

    // Ensure the course exists
    await connection.query(
      `INSERT INTO course (courseID, courseName, isArchived, instructorID) VALUES 
      (${uniqueID + 3}, 'Test Course', FALSE, ${uniqueID + 2})
      ON DUPLICATE KEY UPDATE courseName = 'Test Course'`
    );
  });

  afterAll(async () => {
    if (connection) {
      await connection.query(`DELETE FROM enrollment WHERE studentID = ${uniqueID + 1} AND courseID = ${uniqueID + 3}`);
      await connection.query(`DELETE FROM course WHERE courseID = ${uniqueID + 3}`);
      await connection.query(`DELETE FROM instructor WHERE instructorID = ${uniqueID + 2}`);
      await connection.query(`DELETE FROM student WHERE studentID = ${uniqueID + 1}`);
      await connection.query(`DELETE FROM user WHERE userID IN (${uniqueID + 1}, ${uniqueID + 2})`);
      connection.release();
    }
  });

  test('should enroll a student successfully', async () => {
    const userID = (uniqueID + 1).toString();
    const courseID = (uniqueID + 3).toString();

    await enrollStudent(userID, courseID, global.pool);

    const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.query(
      `SELECT * FROM enrollment WHERE studentID = ? AND courseID = ?`,
      [userID, courseID]
    );

    expect(rows.length).toBe(1);
    expect(rows[0].studentID).toBe(parseInt(userID));
    expect(rows[0].courseID).toBe(parseInt(courseID));
  });

  test('should handle errors during enrollment', async () => {
    const userID = (uniqueID + 1).toString();
    const invalidCourseID = (uniqueID + 9999).toString(); // Assume this ID does not exist

    await expect(enrollStudent(userID, invalidCourseID, global.pool)).rejects.toThrow();

    const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.query(
      `SELECT * FROM enrollment WHERE studentID = ? AND courseID = ?`,
      [userID, invalidCourseID]
    );

    expect(rows.length).toBe(0);
  });
});