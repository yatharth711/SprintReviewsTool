import mysql from 'mysql2/promise';
import { getStudentsById } from '../../src/db';

describe('getStudentsById Tests', () => {
  let connection: mysql.PoolConnection;
    // Since multiple tests are being run, use a baseID to ensure unique IDs
  // then only test for getting theses specific courses
  const uniqueID = Math.floor(Math.random() * 1000000); // Base value for unique IDs

  beforeAll(async () => {
    connection = await global.pool.getConnection();

    // Ensure the user and student exist
    await connection.query(
      `INSERT INTO user (userID, firstName, lastName, email, pwd, userRole) VALUES 
      (${uniqueID + 1}, 'Test', 'Student', 'test.student@example.com', 'password123', 'student')
      ON DUPLICATE KEY UPDATE email = VALUES(email)`
    );

    await connection.query(
      `INSERT INTO student (userID, studentID, phoneNumber, homeAddress, dateOfBirth) VALUES 
      (${uniqueID + 1}, ${uniqueID + 2}, '555-1234', '123 Test St', '2000-01-01')
      ON DUPLICATE KEY UPDATE phoneNumber = VALUES(phoneNumber)`
    );
  });

  afterAll(async () => {
    if (connection) {
      await connection.query(`DELETE FROM student WHERE userID = ${uniqueID + 1}`);
      await connection.query(`DELETE FROM user WHERE userID = ${uniqueID + 1}`);
      connection.release();
    }
  });

  test('should return student details for a valid studentID', async () => {
    const student = await getStudentsById(uniqueID + 2, global.pool);

    expect(student).toBeDefined();
    expect(student).toHaveProperty('userID', uniqueID + 1);
    expect(student).toHaveProperty('studentID', uniqueID + 2);
    expect(student).toHaveProperty('firstName', 'Test');
    expect(student).toHaveProperty('lastName', 'Student');
    expect(student).toHaveProperty('email', 'test.student@example.com');
  });

  test('should return null for an invalid studentID', async () => {
    const student = await getStudentsById(9999, global.pool); // Assume this ID does not exist

    expect(student).toBeNull();
  });

  test('should handle database errors', async () => {
    const mockPool = {
      execute: jest.fn().mockImplementation(() => {
        throw new Error('Simulated database error');
      }),
    };

    await expect(getStudentsById(uniqueID + 2, mockPool as unknown as mysql.Pool)).rejects.toThrow('Simulated database error');
  });
});
