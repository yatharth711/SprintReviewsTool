// tests-jest/getCourseGroups.test.ts
import mysql from 'mysql2/promise';
import { getCourseGroups } from '../../src/db';

describe('getCourseGroups Tests', () => {
  let connection: mysql.PoolConnection;
  let uniqueID: number;

  // Setup database connection before all tests
  beforeAll(async () => {
    try {
      connection = await global.pool.getConnection();
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw error;
    }
  });

  // Clean up database and release connection after all tests
  afterAll(async () => {
    if (connection) {
      await connection.release();
    }
  });

  // Setup unique IDs and data before each test
  beforeEach(async () => {
    uniqueID = Math.floor(Math.random() * 1000000); // Base value for unique IDs

    // Insert test users
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES 
      (${uniqueID + 1}, 'Test', 'Instructor', 'test.instructor.${uniqueID}@example.com', 'password123', 'instructor'),
      (${uniqueID + 3}, 'Test', 'Student1', 'test.student1.${uniqueID}@example.com', 'password123', 'student'),
      (${uniqueID + 4}, 'Test', 'Student2', 'test.student2.${uniqueID}@example.com', 'password123', 'student')
      ON DUPLICATE KEY UPDATE email = VALUES(email)`
    );

    // Insert the test instructor
    await connection.query(
      `INSERT INTO instructor (instructorID, userID, isAdmin, departments) VALUES 
      (${uniqueID + 1}, ${uniqueID + 1}, TRUE, 'Test Department') 
      ON DUPLICATE KEY UPDATE departments = 'Test Department'`
    );

    // Insert the test course
    await connection.query(
      `INSERT INTO course (courseID, courseName, isArchived, instructorID) VALUES 
      (${uniqueID + 2}, 'Test Course', FALSE, ${uniqueID + 1}) 
      ON DUPLICATE KEY UPDATE courseName = 'Test Course'`
    );

    // Insert the test students
    await connection.query(
      `INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES 
      (${uniqueID + 3}, ${uniqueID + 3}, '555-1234', '123 Elm Street', '2000-01-01'), 
      (${uniqueID + 4}, ${uniqueID + 4}, '555-5678', '456 Oak Street', '2001-02-02') 
      ON DUPLICATE KEY UPDATE phoneNumber = VALUES(phoneNumber)`
    );

    // Insert test groups
    await connection.query(
      `INSERT INTO course_groups (groupID, studentID, courseID) VALUES 
      (1, ${uniqueID + 3}, ${uniqueID + 2}), 
      (1, ${uniqueID + 4}, ${uniqueID + 2})`
    );
  });

  // Clean up database after each test
  afterEach(async () => {
    if (connection) {
      await connection.query(`DELETE FROM course_groups WHERE courseID = ${uniqueID + 2}`);
      await connection.query(`DELETE FROM course WHERE courseID = ${uniqueID + 2}`);
      await connection.query(`DELETE FROM student WHERE studentID IN (${uniqueID + 3}, ${uniqueID + 4})`);
      await connection.query(`DELETE FROM instructor WHERE instructorID = ${uniqueID + 1}`);
      await connection.query(`DELETE FROM user WHERE userID IN (${uniqueID + 1}, ${uniqueID + 3}, ${uniqueID + 4})`);
    }
  });

  test('should successfully fetch groups for a valid course ID', async () => {
    const courseID = uniqueID + 2;

    try {
      const groups = await getCourseGroups(courseID, global.pool);

      expect(groups).toBeDefined();
      expect(groups.length).toBe(2);

      // Check if each student is correctly assigned to their group
      const group1Students = groups.filter(row => row.groupID === 1);
      expect(group1Students.length).toBe(2);
      expect(group1Students.map(row => row.studentID)).toEqual([uniqueID + 3, uniqueID + 4]);
    } catch (error) {
      console.error('Error in getCourseGroups with valid course ID:', error);
      throw error;
    }
  });

  test('should return an empty array for a course with no groups', async () => {
    const courseID = uniqueID + 9999;

    try {
      const groups = await getCourseGroups(courseID, global.pool);

      expect(groups).toBeDefined();
      expect(groups.length).toBe(0);
    } catch (error) {
      console.error('Error in getCourseGroups with no groups:', error);
      throw error;
    }
  });

  test('should throw an error if courseID is not provided', async () => {
    const invalidCourseID = null as unknown as number;

    await expect(getCourseGroups(invalidCourseID, global.pool)).rejects.toThrow();
  });

  test('should handle database operation errors', async () => {
    const courseID = uniqueID + 2;

    // Create a pool with incorrect connection information
    const faultyPool = mysql.createPool({
      host: 'invalid-host',
      port: 9999,
      user: 'wrong-user',
      password: 'wrong-password',
      database: 'wrong-database',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    try {
      await expect(getCourseGroups(courseID, faultyPool)).rejects.toThrow();
    } catch (error) {
      console.error('Unknown error in getCourseGroups:', error);
    } finally {
      // Ensure the faulty pool is closed after the test
      await faultyPool.end();
    }
  });
});
