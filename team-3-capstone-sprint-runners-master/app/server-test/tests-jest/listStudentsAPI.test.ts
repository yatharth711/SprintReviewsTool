// tests-jest/listStudentsAPI.test.ts
import handler from '../../src/pages/api/listStudents';
import { getStudentsById } from '../../src/db';
import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import formidable from 'formidable';
import { parse as csvParse } from 'csv-parse';

jest.mock('../../src/db', () => ({
  getStudentsById: jest.fn(),
}));

jest.mock('fs');
jest.mock('formidable', () => {
  const original = jest.requireActual('formidable');
  return {
    ...original,
    IncomingForm: jest.fn(),
  };
});
jest.mock('csv-parse', () => {
  const original = jest.requireActual('csv-parse');
  return {
    ...original,
    parse: jest.fn(),
  };
});

describe('API endpoint handler tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should parse CSV and return student details successfully', async () => {
    const mockForm = {
      parse: jest.fn((req, callback) => {
        callback(null, {}, { file: [{ filepath: '/tmp/testfile.csv' }] });
      }),
    };
    (formidable.IncomingForm as unknown as jest.Mock).mockImplementation(() => mockForm);

    const csvData = [
      { studentID: '1' },
      { studentID: '2' },
    ];

    const getStudentsByIdMock = getStudentsById as jest.Mock;
    getStudentsByIdMock.mockResolvedValueOnce({ id: 1, name: 'John Doe' });
    getStudentsByIdMock.mockResolvedValueOnce({ id: 2, name: 'Jane Doe' });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    const mockStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (this: any, event, callback) {
        if (event === 'data') {
          csvData.forEach(callback);
        } else if (event === 'end') {
          callback();
        }
        return this;
      }),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    await handler(req, res);

    // Wait for the response to be fully set
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Debugging output
    console.log('Response status:', res._getStatusCode());
    console.log('Response body:', res._getData());

    const responseBody = res._getData();
    console.log('Response JSON:', responseBody);

    // Ensure the response body is correctly set before parsing
    expect(() => JSON.parse(responseBody)).not.toThrow();
    expect(JSON.parse(responseBody)).toEqual({
      message: 'Students retrieved successfully',
      students: [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }],
      missingData: [],
      showInPopup: true,
    });

    expect(getStudentsByIdMock).toHaveBeenCalledTimes(2);
    expect(getStudentsByIdMock).toHaveBeenCalledWith('1');
    expect(getStudentsByIdMock).toHaveBeenCalledWith('2');
  });

  test('should return 400 if no file is uploaded', async () => {
    const mockForm = {
      parse: jest.fn((req, callback) => {
        callback(null, {}, {});
      }),
    };
    (formidable.IncomingForm as unknown as jest.Mock).mockImplementation(() => mockForm);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'No file uploaded' });
  });

  test('should return 500 if there is an error uploading file', async () => {
    const mockForm = {
      parse: jest.fn((req, callback) => {
        callback(new Error('Upload error'), {}, {});
      }),
    };
    (formidable.IncomingForm as unknown as jest.Mock).mockImplementation(() => mockForm);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error uploading file', error: 'Upload error' });
  });

  test('should return 500 if there is an error retrieving students from the database', async () => {
    const mockForm = {
      parse: jest.fn((req, callback) => {
        callback(null, {}, { file: [{ filepath: '/tmp/testfile.csv' }] });
      }),
    };
    (formidable.IncomingForm as unknown as jest.Mock).mockImplementation(() => mockForm);

    const csvData = [{ studentID: '1' }];

    const getStudentsByIdMock = getStudentsById as jest.Mock;
    getStudentsByIdMock.mockRejectedValueOnce(new Error('Database error'));

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    const mockStream = {
      pipe: jest.fn().mockReturnThis(),
      on: jest.fn().mockImplementation(function (this: any, event, callback) {
        if (event === 'data') {
          csvData.forEach(callback);
        } else if (event === 'end') {
          callback();
        }
        return this;
      }),
    };

    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Error retrieving students from database' });
  });
});
