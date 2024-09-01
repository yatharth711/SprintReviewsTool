// tests-jest/unenrollStudentAPI.test.ts
import handler from '../../src/pages/api/unenrollStudent';
import { query } from '../../src/db';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  query: jest.fn(),
}));

describe('API endpoint handler tests for unenrollStudent', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  test('should successfully unenroll a student', async () => {
    (query as jest.Mock).mockResolvedValueOnce({ affectedRows: 1 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentID: 1,
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: 'Successfully unenrolled student 1 from course 101',
    });
  });

  test('should return 400 if studentID or courseID is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentID: 1,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({
      message: 'Missing studentID or courseID',
    });
  });

  test('should return 405 for unsupported methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({
      message: 'Method not allowed',
    });
  });

  test('should return 404 if student or course is not found', async () => {
    (query as jest.Mock).mockResolvedValueOnce({ affectedRows: 0 });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentID: 1,
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getJSONData()).toEqual({
      message: 'Student or course not found',
    });
  });

  test('should return 500 if there is a server error', async () => {
    const mockError = new Error('Database error');
    (query as jest.Mock).mockRejectedValueOnce(mockError);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        studentID: 1,
        courseID: 101,
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: 'Failed to unenroll student',
      error: mockError.message,
    });
  });
});
