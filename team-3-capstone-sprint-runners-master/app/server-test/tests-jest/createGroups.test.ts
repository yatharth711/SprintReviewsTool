// tests-jest/createGroups.test.ts
import mysql from 'mysql2/promise';
import { createGroups } from '../../src/db';

describe('createGroups Tests', () => {
  let connection: mysql.PoolConnection;
  // Since multiple tests are being run, use a baseID to ensure unique IDs
  // then only test for getting theses specific courses
  const uniqueID = Math.floor(Math.random() * 1000000); // Base value for unique IDs

  // Setup database connection and initial data before all tests
  beforeAll(async () => {
    try {
      connection = await global.pool.getConnection();
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw error;
    }

    // Insert a test instructor
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES (${uniqueID + 1}, 'Test', 'Instructor', 'test.instructor@example.com', 'password123', 'instructor') ON DUPLICATE KEY UPDATE email = 'test.instructor@example.com'`
    );
    await connection.query(
      `INSERT INTO instructor (instructorID, userID, isAdmin, departments) VALUES (${uniqueID + 1}, ${uniqueID + 1}, TRUE, 'Test Department') ON DUPLICATE KEY UPDATE departments = 'Test Department'`
    );

    // Insert a test course
    await connection.query(
      `INSERT INTO course (courseID, courseName, isArchived, instructorID) VALUES (${uniqueID + 2}, 'Test Course', FALSE, ${uniqueID + 1}) ON DUPLICATE KEY UPDATE courseName = 'Test Course'`
    );

    // Insert test students
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES (${uniqueID + 3}, 'Test', 'Student1', 'test.student1@example.com', 'password123', 'student') ON DUPLICATE KEY UPDATE email = 'test.student1@example.com'`
    );
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES (${uniqueID + 4}, 'Test', 'Student2', 'test.student2@example.com', 'password123', 'student') ON DUPLICATE KEY UPDATE email = 'test.student2@example.com'`
    );
    await connection.query(
      `INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES (${uniqueID + 3}, ${uniqueID + 3}, '555-1234', '123 Elm Street', '2000-01-01') ON DUPLICATE KEY UPDATE phoneNumber = '555-1234'`
    );
    await connection.query(
      `INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES (${uniqueID + 4}, ${uniqueID + 4}, '555-5678', '456 Oak Street', '2001-02-02') ON DUPLICATE KEY UPDATE phoneNumber = '555-5678'`
    );
  });

  // Clean up the database after all tests
  afterAll(async () => {
    if (connection) {
      // Delete the test data from the course, student, instructor, and user tables
      await connection.query(`DELETE FROM course WHERE courseID = ${uniqueID + 2}`);
      await connection.query(`DELETE FROM student WHERE studentID IN (${uniqueID + 3}, ${uniqueID + 4})`);
      await connection.query(`DELETE FROM instructor WHERE instructorID = ${uniqueID + 1}`);
      await connection.query(`DELETE FROM user WHERE userID IN (${uniqueID + 1}, ${uniqueID + 3}, ${uniqueID + 4})`);
      connection.release(); // Release the connection back to the pool
    }
  });

  test('should successfully create groups with valid data', async () => {
    const groups = [
      { groupNumber: 1, studentIDs: [uniqueID + 3, uniqueID + 4] },
    ];
    const courseID = uniqueID + 2;

    try {
      await createGroups(groups, courseID, global.pool);

      const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.query(
        `SELECT * FROM course_groups WHERE courseID = ?`,
        [courseID]
      );

      expect(rows).toBeDefined();
      expect(rows.length).toBe(2);

      // Check if each student is correctly assigned to their group
      const group1Students = rows.filter(row => row.groupID === 1);
      expect(group1Students.length).toBe(2);
      expect(group1Students.map(row => row.studentID)).toEqual([uniqueID + 3, uniqueID + 4]);

    } catch (error) {
      console.error('Error in createGroups with valid data:', error);
      throw error;
    } finally {
      // Clean up: Delete the created groups
      await connection.query(`DELETE FROM course_groups WHERE courseID = ?`, [courseID]);
    }
  });

  test('should throw an error if groups are not provided', async () => {
    const invalidGroups = null;
    const courseID = uniqueID + 2;

    await expect(createGroups(invalidGroups, courseID, global.pool)).rejects.toThrow('Invalid input');
  });

  test('should throw an error if courseID is not provided', async () => {
    const groups = [
      { groupNumber: 1, studentIDs: [uniqueID + 3, uniqueID + 4] },
    ];
    const invalidCourseID = null;

    await expect(createGroups(groups, invalidCourseID, global.pool)).rejects.toThrow('Invalid input');
  });

  test('should handle database operation errors', async () => {
    const groups = [
      { groupNumber: 1, studentIDs: [uniqueID + 3, uniqueID + 4] },
    ];
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
      await expect(createGroups(groups, courseID, global.pool)).rejects.toThrow();
    } catch (error) {
      console.error('Unknown error in createGroups:', error);
    } finally {
      // Ensure the faulty pool is closed after the test
      await faultyPool.end();
    }
  });

  test('should delete existing groups before inserting new ones', async () => {
    const initialGroups = [
      { groupNumber: 1, studentIDs: [uniqueID + 3, uniqueID + 4] },
    ];
    const newGroups = [
      { groupNumber: 1, studentIDs: [uniqueID + 4] },
    ];
    const courseID = uniqueID + 2;

    try {
      await createGroups(initialGroups, courseID, global.pool);

      // Insert new groups
      await createGroups(newGroups, courseID, global.pool);

      const [rows]: [mysql.RowDataPacket[], mysql.FieldPacket[]] = await connection.query(
        `SELECT * FROM course_groups WHERE courseID = ?`,
        [courseID]
      );

      expect(rows).toBeDefined();
      expect(rows.length).toBe(1);

      // Check if the old groups were deleted
      const group1Students = rows.filter(row => row.groupID === 1);
      expect(group1Students.length).toBe(1);
      expect(group1Students.map(row => row.studentID)).toEqual([uniqueID + 4]);

    } catch (error) {
      console.error('Error in createGroups during group replacement:', error);
      throw error;
    } finally {
      // Clean up: Delete the created groups
      await connection.query(`DELETE FROM course_groups WHERE courseID = ?`, [courseID]);
    }
  });
});
