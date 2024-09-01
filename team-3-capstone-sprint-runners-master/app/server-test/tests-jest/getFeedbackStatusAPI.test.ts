// jest-tests/getFeedbackStatusAPI.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/getFeedbackStatus';
import { query, getStudentsById } from '../../src/db';
import type { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  query: jest.fn(),
  getStudentsById: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/groups/getFeedbackStatus API Endpoint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 if method is not GET', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });

  it('should return feedback status if method is GET', async () => {
    const assignmentID = '1';
    const reviewerID = '2';
    const studentID = 123;
    const feedbackCount = 1;

    (getStudentsById as jest.Mock).mockResolvedValue({ studentID });
    (query as jest.Mock).mockResolvedValue([{ feedbackCount }]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { assignmentID, reviewerID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ isFeedbackSubmitted: true });
    expect(getStudentsById).toHaveBeenCalledWith(parseInt(reviewerID));
    expect(query).toHaveBeenCalledWith(expect.any(String), [parseInt(assignmentID), studentID]);
  });

  it('should handle errors gracefully', async () => {
    const assignmentID = '1';
    const reviewerID = '2';

    (getStudentsById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'GET',
      query: { assignmentID, reviewerID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error checking feedback status' });
  });
});
