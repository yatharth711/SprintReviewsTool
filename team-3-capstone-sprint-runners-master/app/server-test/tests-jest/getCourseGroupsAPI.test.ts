// getCourseGroups.test.ts

import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/getCourseGroups';
import { getCourseGroups } from '../../src/db';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock the database function
jest.mock('../../src/db', () => ({
  getCourseGroups: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/getCourseGroups API handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(405);
    expect(res._isEndCalled()).toBe(true);
  });

  it('should return 200 and fetch groups successfully', async () => {
    const courseID = '123';
    const groups = [
      ['student1', 'student2'],
      ['student3', 'student4'],
    ];

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        courseID,
      },
    });

    (getCourseGroups as jest.Mock).mockResolvedValueOnce(groups);

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual(groups);
    expect(getCourseGroups).toHaveBeenCalledWith(Number(courseID));
  });

  it('should return 500 if there is an error fetching groups', async () => {
    const courseID = '123';
    const errorMessage = 'Database error';

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        courseID,
      },
    });

    (getCourseGroups as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch students', details: errorMessage });
    expect(getCourseGroups).toHaveBeenCalledWith(Number(courseID));
  });
});
