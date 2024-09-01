// tests-jest/getGroupDetailsAPI.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/getGroupDetails';
import { query, getStudentsById } from '../../src/db';
import { NextApiRequest, NextApiResponse } from 'next';

jest.mock('../../src/db', () => ({
  query: jest.fn(),
  getStudentsById: jest.fn(),
}));

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/groups/getGroupDetails API Endpoint', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return group details if they exist', async () => {
    const courseID = '1';
    const userID = '2';
    const studentID = 123;
    const groupID = 456;
    const result = [
      { groupID, studentID: 124, firstName: 'John', lastName: 'Doe' },
      { groupID, studentID: 125, firstName: 'Jane', lastName: 'Smith' },
      { groupID, studentID: 123, firstName: 'Alice', lastName: 'Johnson' }, // Current user's studentID
    ];

    (getStudentsById as jest.Mock).mockResolvedValue({ studentID });
    (query as jest.Mock).mockResolvedValue(result);

    const { req, res } = createMocks({
      method: 'GET',
      query: { courseID, userID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      groupID,
      students: [
        { studentID: 124, firstName: 'John', lastName: 'Doe' },
        { studentID: 125, firstName: 'Jane', lastName: 'Smith' },
      ],
    });
    expect(getStudentsById).toHaveBeenCalledWith(parseInt(userID));
    expect(query).toHaveBeenCalledWith(expect.any(String), [parseInt(courseID), parseInt(courseID), studentID]);
  });

  it('should return 404 if no group details are found', async () => {
    const courseID = '1';
    const userID = '2';
    const studentID = 123;

    (getStudentsById as jest.Mock).mockResolvedValue({ studentID });
    (query as jest.Mock).mockResolvedValue([]);

    const { req, res } = createMocks({
      method: 'GET',
      query: { courseID, userID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ message: 'Group not found' });
  });

  it('should handle errors gracefully', async () => {
    const courseID = '1';
    const userID = '2';

    (getStudentsById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const { req, res } = createMocks({
      method: 'GET',
      query: { courseID, userID },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Error fetching group details' });
  });
});
