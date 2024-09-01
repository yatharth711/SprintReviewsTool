// removeGroups.test.ts

import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/removeGroups';
import { query } from '../../src/db';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock the database function
jest.mock('../../src/db', () => ({
  query: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/groups/removeGroups API handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: 'Method not allowed' });
  });

  it('should return 400 if courseID is not provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'CourseID is required' });
  });

  it('should return 200 and remove groups successfully', async () => {
    const courseID = '123';

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        courseID,
      },
    });

    (query as jest.Mock).mockResolvedValueOnce(null);

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ message: 'Groups removed successfully' });
    expect(query).toHaveBeenCalledWith('DELETE FROM course_groups WHERE courseID = ?', [courseID]);
  });

  it('should return 500 if there is an error removing groups', async () => {
    const courseID = '123';
    const errorMessage = 'Database error';

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        courseID,
      },
    });

    (query as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' });
    expect(query).toHaveBeenCalledWith('DELETE FROM course_groups WHERE courseID = ?', [courseID]);
  });
});
