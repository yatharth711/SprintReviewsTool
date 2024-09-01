// randomizeGroups.test.ts

import { createMocks } from 'node-mocks-http';
import handler from '../../src/pages/api/groups/randomizeGroups';
import type { NextApiRequest, NextApiResponse } from 'next';

// Define a type that extends NextApiRequest with properties needed by node-mocks-http
type MockNextApiRequest = ReturnType<typeof createMocks>['req'] & NextApiRequest;
type MockNextApiResponse = ReturnType<typeof createMocks>['res'] & NextApiResponse;

describe('/api/createNew/randomizeGroups API handler', () => {
  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getJSONData()).toEqual({ error: 'Method not allowed' });
  });

  it('should return 400 if groupSize or studentIds are not provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        groupSize: 3,
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid request. Ensure there are students enrolled in this course.' });

    const { req: req2, res: res2 } = createMocks({
      method: 'POST',
      body: {
        studentIds: [1, 2, 3],
      },
    });

    await handler(req2 as unknown as MockNextApiRequest, res2 as unknown as MockNextApiResponse);

    expect(res2._getStatusCode()).toBe(400);
    expect(res2._getJSONData()).toEqual({ error: 'Invalid request. Ensure there are students enrolled in this course.' });
  });

  it('should return 400 if groupSize is larger than the number of students', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        groupSize: 5,
        studentIds: [1, 2],
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Group size is larger than the number of students' });
  });

  it('should return 201 and create groups successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        groupSize: 2,
        studentIds: [1, 2, 3, 4],
      },
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(201);
    expect(res._getJSONData()).toEqual({
      message: 'Groups created successfully',
      groups: [
        { id: 1, members: expect.any(Array) },
        { id: 2, members: expect.any(Array) },
      ],
    });
  });

  it('should return 500 if there is an error creating groups', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        groupSize: 2,
        studentIds: [1, 2, 3, 4],
      },
    });

    jest.spyOn(global.Math, 'random').mockImplementation(() => {
      throw new Error('Randomization error');
    });

    await handler(req as unknown as MockNextApiRequest, res as unknown as MockNextApiResponse);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Error creating groups', details: 'Randomization error' });

    jest.spyOn(global.Math, 'random').mockRestore();
  });
});
