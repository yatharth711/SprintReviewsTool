// tests-jest/submitAssignmentAPI.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/assignments/submitAssignment';
import { query, getStudentsById } from '../../src/db';
import * as fs from 'fs/promises';
import multer from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  query: jest.fn(),
  getStudentsById: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  unlink: jest.fn(),
}));

jest.mock('multer', () => {
  const multer = jest.fn(() => {
    const instance = {
      single: jest.fn((field) => (req: { file: { path: string; originalname: string; mimetype: string; }; }, res: any, next: () => void) => {
        req.file = {
          path: '/tmp/test-file',
          originalname: 'test-file.txt',
          mimetype: 'text/plain',
        };
        next();
      }),
    };
    return instance;
  });
  return multer;
});

describe('/api/assignments/submitAssignment API Endpoint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 if method is not POST', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });

  it('should handle file upload and submit assignment successfully', async () => {
    const assignmentID = '1';
    const userID = '2';
    const studentID = 123;
    const fileContent = Buffer.from('file content');
    const isGroupAssignment = '0';

    (getStudentsById as jest.Mock).mockResolvedValue({ studentID });
    (query as jest.Mock).mockResolvedValue({});
    (fs.readFile as jest.Mock).mockResolvedValue(fileContent);
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        assignmentID,
        userID,
        isGroupAssignment,
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      success: true,
      message: 'Assignment submitted successfully',
      results: [{ success: true, message: 'Assignment submitted successfully' }],
    });

    expect(getStudentsById).toHaveBeenCalledWith(parseInt(userID));
    expect(query).toHaveBeenCalledWith(
      expect.any(String),
      [parseInt(assignmentID), studentID, 'test-file.txt', fileContent, 'text/plain', null]
    );
    expect(fs.unlink).toHaveBeenCalledWith('/tmp/test-file');
  });

  it('should handle errors gracefully', async () => {
    const assignmentID = '1';
    const userID = '2';
    const isGroupAssignment = '0';

    (getStudentsById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        assignmentID,
        userID,
        isGroupAssignment,
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error submitting assignment' });
  });

  it('should return 500 if file upload fails', async () => {
    const assignmentID = '1';
    const userID = '2';
    const isGroupAssignment = '0';

    const multerMock = multer as unknown as jest.Mock;
    multerMock.mockImplementation(() => {
      return {
        single: () => (req: any, res: any, next: (arg0: Error) => void) => {
          next(new Error('File upload error'));
        },
      };
    });

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        assignmentID,
        userID,
        isGroupAssignment,
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error submitting assignment' });
  });
});
