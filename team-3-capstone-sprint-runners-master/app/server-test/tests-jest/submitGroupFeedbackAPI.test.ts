// tests-jest/submitGroupFeedbackAPI.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/submitGroupFeedback';
import { query, getStudentsById } from '../../src/db';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  query: jest.fn(),
  getStudentsById: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/groups/submitGroupFeedback API Endpoint', () => {
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

  it('should submit feedback successfully', async () => {
    const assignmentID = 1;
    const reviewerID = 2;
    const studentID = 123;
    const feedbacks = [
      { revieweeID: 3, score: 4, content: 'Great job' },
      { revieweeID: 4, score: 5, content: 'Excellent work' },
    ];

    (getStudentsById as jest.Mock).mockResolvedValue({ studentID });
    (query as jest.Mock).mockResolvedValue({});

    const { req, res } = createMocks({
      method: 'POST',
      body: { feedbacks, assignmentID, reviewerID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ success: true });
    expect(getStudentsById).toHaveBeenCalledWith(reviewerID);
    feedbacks.forEach(feedback => {
      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [assignmentID, studentID, feedback.revieweeID, feedback.score, feedback.content]
      );
    });
  });

  it('should handle errors gracefully', async () => {
    const assignmentID = 1;
    const reviewerID = 2;
    const feedbacks = [
      { revieweeID: 3, score: 4, content: 'Great job' },
    ];

    (getStudentsById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { feedbacks, assignmentID, reviewerID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error submitting feedback' });
  });
});
