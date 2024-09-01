import type { NextApiRequest, NextApiResponse } from 'next';
import { autoRelease, query,
    updateAssignment, updateAssignmentName, updateCourse, updateEnrollment,

    updateFeedback, updateReview, updateReviewCriteria, updateReviewer, updateStudent,

    updateSubmission, updateUser, updateReviewGroups
,updateReviewDates, updateGroupFeedback, updateStudentNotifications

 } from '../../db';

import { calculateAndUpdateAverageGrade } from './groups/submitGroupFeedback';
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { table, data } = req.body;

        if (!table || !data) {
            return res.status(400).json({ message: 'Missing table or data' });
        }

        try {
        let result;
        switch (table) { // Switch statement to determine which table to update
            case 'assignmentInfo':
            result = await updateAssignment(data.assignmentID, data.isGroupAssignment, data.allowedFileTypes, data.startDate, data.endDate, data.dueDate);
            break;

            case 'assignmentName':
            if (!data.title) {
                data.title = undefined; 
            }
            if (!data.description) {   
                data.description = undefined;
            }
            result = await updateAssignmentName(data.assignmentID, data.title, data.description);
            break;
            
            case 'course':
            if (!data.courseName) {
                data.courseName = undefined;
            }
            if (!data.instrcutorID) {
                data.instrcutorID = undefined;
            }
            result = await updateCourse(data.courseID, data.courseName, data.instrcutorID);
            break;
            
            case 'enrollment':
            result = await updateEnrollment(data.studentID, data.courseID);
            break;
            
            case 'feedback':
            result = await updateFeedback(data.assignmentID, data.studentID, data.feedback);
            break;

            case 'groupFeedback':
            result = await Promise.all(data.map((feedback: any) => 
                updateGroupFeedback(feedback.assignmentID, feedback.content, feedback.score, feedback.reviewerID, feedback.revieweeID)
            ));
            await Promise.all(data.map((feedback: any) => 
                calculateAndUpdateAverageGrade(feedback.assignmentID, feedback.revieweeID)
            ));
            break;
            
            case 'reviewCriteria':
            if (!data.criteria) {
                data.criteria = undefined; 
            }
            if (!data.marks) {
                data.marks = undefined;
            }
            result = await updateReviewCriteria(data.assignmentID, data.criteria, data.marks);
            break;
            
            case 'reviewer':
                    result = await updateReviewer(data.studentID, data.assignmentID, data.submissionID);
                    break;
           
            case 'student':
            if (!data.phoneNumber) {
                data.phoneNumber = undefined; 
            }
            if (!data.address) {
                data.address = undefined;
            }
            if (!data.dob) {
                data.dob = undefined;
            }
            result = await updateStudent(data.studentID, data.userID, data.phoneNumber, data.address, data.dob); 
            break;
            
            case 'submission':
            if (!data.fileName) {
                data.fileName = undefined; 
            }
            if (!data.fileContent) {
                data.fileName = undefined; 
            }
            if (!data.fileType) {
                data.fileType = undefined; 
            }
            if (!data.subDate) {
                data.subDate = undefined; 
            }
            if (!data.autoGrade) {
                data.autoGrade = undefined; 
            }
            if (!data.grade) {
                data.grade = undefined; 
            }
            if (!data.assignmentID) {   
                data.assignmentID = undefined; 
            }
            if (!data.studentID) {   
                data.studentID = undefined;
            }
            result = await updateSubmission(data.submissionID, data.assignmentID, data.studentID, data.fileName, data.fileContent, data.fileType, data.subDate, data.autoGrade, data.grade);
            break;
            
            case 'user':
            if (!data.fname) {
                data.fname = undefined; 
            }
            if (!data.lname) {
                data.lname = undefined; 
            }
            if (!data.email) {
                data.email = undefined; 
            }
            if (!data.password) {
                data.password = undefined; 
            }
            result = await updateUser(data.userID, data.fname, data.lname, data.email, data.password);
            break;

            case 'reviewGroups':
                result = await updateReviewGroups(data.assignmentID, data.courseID, data.groups, data.reviewsPerAssignment, data.randomize);
                break;

            case 'reviewDates':
                result = await updateReviewDates(data.reviewID, data.startDate, data.endDate, data.deadline, data.anonymous);
            break;

            case 'review':
                if(!data.reviewID){
                    data.reviewID = undefined;
                }
                if(!data.assignmentID){
                    data.assignmentID = undefined;
                }
                if(!data.isGroupAssignment){
                    data.isGroupAssignment = undefined;
                }
                if(!data.allowedFileTypes){
                    data.allowedFileTypes = undefined;
                }
                if(!data.startDate){
                    data.startDate = undefined;
                }
                if(!data.endDate){
                    data.endDate = undefined;
                }
                if(!data.deadline){
                    data.deadline = undefined;
                }
                if(!data.anonymous){
                    data.anonymous = undefined;
                }
                result = await updateReview(data.reviewID, data.assignmentID, data.isGroupAssignment, data.allowedFileTypes, data.startDate, data.endDate, data.deadline, data.anonymous);
                if (data.autoRelease) {
                    await autoRelease(data.assignmentID);
                }
                break;

                case 'studentNotifications':
                    result = await updateStudentNotifications(
                        data.studentID,data.assignmentNotification, data.reviewNotification);
                    break;

            default:
            return res.status(400).json({ message: 'Invalid table' });
        }
        res.status(200).json(result);
        } catch (error) {
        console.error('Error updating table:', error);
        res.status(500).json({ message: 'Error updating table' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
