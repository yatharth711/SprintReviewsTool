import handler from '../../src/pages/api/updateTable';
import { NextApiRequest, NextApiResponse } from 'next';
import { updateAssignment, updateAssignmentName, updateCourse, updateEnrollment, updateFeedback, updateReviewCriteria, updateReviewer, updateStudent, updateSubmission, updateUser } from '../../src/db';

jest.mock('../../src/db', () => ({
    updateAssignment: jest.fn(),
    updateAssignmentName: jest.fn(),
    updateCourse: jest.fn(),
    updateEnrollment: jest.fn(),
    updateFeedback: jest.fn(),
    updateReviewCriteria: jest.fn(),
    updateReviewer: jest.fn(),
    updateStudent: jest.fn(),
    updateSubmission: jest.fn(),
    updateUser: jest.fn(),
}));

describe('updateTable handler', () => {
    let req: Partial<NextApiRequest>;
    let res: Partial<NextApiResponse>;

    beforeEach(() => {
        req = {
            method: 'POST',
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
    });

    it('should return 400 if table or data is missing', async () => {
        req.body = {};
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Missing table or data' });
    });

    it('should return 400 for invalid table', async () => {
        req.body = { table: 'invalidTable', data: {} };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid table' });
    });

    it('should call updateAssignment for assignmentInfo table', async () => {
        req.body = { table: 'assignmentInfo', data: { assignmentID: 1, isGroupAssignment: true, allowedFileTypes: ['pdf'], deadline: '2023-12-31' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateAssignment).toHaveBeenCalledWith(1, true, ['pdf'], '2023-12-31');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateAssignmentName for assignmentName table', async () => {
        req.body = { table: 'assignmentName', data: { assignmentID: 1, title: 'New Title', description: 'New Description' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateAssignmentName).toHaveBeenCalledWith(1, 'New Title', 'New Description');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateCourse for course table', async () => {
        req.body = { table: 'course', data: { courseID: 1, courseName: 'New Course', instrcutorID: 2 } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateCourse).toHaveBeenCalledWith(1, 'New Course', 2);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateEnrollment for enrollment table', async () => {
        req.body = { table: 'enrollment', data: { studentID: 1, courseID: 2 } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateEnrollment).toHaveBeenCalledWith(1, 2);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateFeedback for feedback table', async () => {
        req.body = { table: 'feedback', data: { assignmentID: 1, studentID: 2, feedback: 'Good job' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateFeedback).toHaveBeenCalledWith(1, 2, 'Good job');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateReviewCriteria for reviewCriteria table', async () => {
        req.body = { table: 'reviewCriteria', data: { assignmentID: 1, criteria: 'Criteria', marks: 10 } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateReviewCriteria).toHaveBeenCalledWith(1, 'Criteria', 10);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateReviewer for reviewer table', async () => {
        req.body = { table: 'reviewer', data: { studentID: 1, assignmentID: 2, submissionID: 3 } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateReviewer).toHaveBeenCalledWith(1, 2, 3);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateStudent for student table', async () => {
        req.body = { table: 'student', data: { studentID: 1, userID: 2, phoneNumber: '1234567890', address: '123 Street', dob: '2000-01-01' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateStudent).toHaveBeenCalledWith(1, 2, '1234567890', '123 Street', '2000-01-01');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateSubmission for submission table', async () => {
        req.body = { table: 'submission', data: { submissionID: 1, assignmentID: 2, studentID: 3, fileName: 'file.pdf', fileType: 'pdf', subDate: '2023-01-01', grade: 'A' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateSubmission).toHaveBeenCalledWith(1, 2, 3, 'file.pdf', 'pdf', '2023-01-01', 'A');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should call updateUser for user table', async () => {
        req.body = { table: 'user', data: { userID: 1, fname: 'John', lname: 'Doe', email: 'john.doe@example.com', password: 'password' } };
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(updateUser).toHaveBeenCalledWith(1, 'John', 'Doe', 'john.doe@example.com', 'password');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 405 for non-POST methods', async () => {
        req.method = 'GET';
        await handler(req as NextApiRequest, res as NextApiResponse);
        expect(res.setHeader).toHaveBeenCalledWith('Allow', ['POST']);
        expect(res.status).toHaveBeenCalledWith(405);
        expect(res.end).toHaveBeenCalledWith('Method GET Not Allowed');
    });
});