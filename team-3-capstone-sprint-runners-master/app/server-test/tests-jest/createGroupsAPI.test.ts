// createGroups.test.ts

import { createMocks, RequestMethod, MockRequest, MockResponse } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/createGroups';
import { createGroups } from '../../src/db';
import type { NextApiRequest, NextApiResponse } from 'next';

// Mock the database function
jest.mock('../../src/db', () => ({
  createGroups: jest.fn(),
}));

// Custom type to include the required properties for NextApiRequest
interface CustomNextApiRequest extends MockRequest<NextApiRequest> {
  env: any;
}

// Custom type to include the required properties for NextApiResponse
interface CustomNextApiResponse extends MockResponse<NextApiResponse> {}

// Function to create mock NextApiRequest and NextApiResponse
const createNextMocks = (method: RequestMethod, body: any = {}) => {
  const { req, res } = createMocks({
    method,
    body,
  });
  (req as unknown as CustomNextApiRequest).env = {};
  return {
    req: req as unknown as CustomNextApiRequest,
    res: res as unknown as CustomNextApiResponse,
  };
};

describe('/api/groups/createGroups API handler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createNextMocks('GET');

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: 'Method not allowed' });
  });

  it('should return 400 if groups are not provided or empty', async () => {
    const { req, res } = createNextMocks('POST', {
      groups: [],
      courseID: 'course123',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid group input' });
  });

  it('should return 201 and create groups successfully', async () => {
    const groups = [
      ['student1', 'student2'],
      ['student3', 'student4'],
    ];
    const courseID = 'course123';

    const { req, res } = createNextMocks('POST', {
      groups,
      courseID,
    });

    (createGroups as jest.Mock).mockResolvedValueOnce(null);

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({ message: 'Groups created successfully', groups });
    expect(createGroups).toHaveBeenCalledWith(groups, courseID);
  });

  it('should return 500 if there is an error creating groups', async () => {
    const groups = [
      ['student1', 'student2'],
      ['student3', 'student4'],
    ];
    const courseID = 'course123';
    const errorMessage = 'Database error';

    const { req, res } = createNextMocks('POST', {
      groups,
      courseID,
    });

    (createGroups as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Error creating groups', details: errorMessage });
    expect(createGroups).toHaveBeenCalledWith(groups, courseID);
  });
});
