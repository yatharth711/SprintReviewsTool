// tests-jest/enrollStudentsAPI.test.ts
import handler from '../../src/pages/api/addNew/enrollStudents';
import { enrollStudent, getCourse } from '../../src/db';
import { createMocks } from 'node-mocks-http';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  enrollStudent: jest.fn(),
  getCourse: jest.fn(),
}));

jest.mock('fs');
jest.mock('path');

describe('API endpoint handler tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules(); // Ensures that there is no module state carried over
  });

  test('should enroll students successfully and handle missing students', async () => {
    (enrollStudent as jest.Mock)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('Database error'))
      .mockResolvedValueOnce(undefined);
    (getCourse as jest.Mock).mockResolvedValueOnce({ courseName: 'TestCourse' });
    const writeFileSyncMock = fs.writeFileSync as jest.Mock;

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentIDs: [1, 2, 3],
        courseID: 101,
      },
    });

    path.join = jest.fn().mockReturnValue('/public/course101_missingStudents.csv');

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      courseID: 101,
      missingStudentsFilePath: '/public/course101_missingStudents.csv',
      studentIDs: [1, 2, 3],
    });
    expect(enrollStudent).toHaveBeenCalledTimes(3);
    expect(enrollStudent).toHaveBeenCalledWith("1", "101");
    expect(enrollStudent).toHaveBeenCalledWith("2", "101");
    expect(enrollStudent).toHaveBeenCalledWith("3", "101");
    expect(writeFileSyncMock).toHaveBeenCalledWith(
      '/public/course101_missingStudents.csv',
      'studentID\n2'
    );
  });

  test('should handle enrollment for a single student', async () => {
    (enrollStudent as jest.Mock).mockResolvedValueOnce(undefined);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentIDs: [1],
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      courseID: 101,
      studentIDs: [1],
    });
    expect(enrollStudent).toHaveBeenCalledTimes(1);
    expect(enrollStudent).toHaveBeenCalledWith("1", "101");
  });

  test('should return 400 if studentIDs array is invalid', async () => {
    const mockError = new Error('studentIDs is not iterable');
    (enrollStudent as jest.Mock).mockRejectedValue(mockError);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentIDs: null,
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      error: 'Invalid studentIDs array',
    });
  });

  test('should return 409 if a student is already enrolled', async () => {
    const mockError = { code: 'ER_DUP_ENTRY' };
    (enrollStudent as jest.Mock).mockRejectedValue(mockError);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentIDs: [1],
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(409);
    expect(res._getJSONData()).toEqual({
      error: 'Student 1 is already enrolled in course 101',
    });
  });

  test('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });
});
