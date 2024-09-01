import { createUser, createStudent, createInstructor, addAssignmentToCourse, 
  selectStudentForSubmission, createCourse, enrollStudent, submitAssignment, 
  createReview, addReviewCriteria, selectStudentsForAssignment, createGroups, 
  getCourse, getInstructor, getReviewCriteria, getStudent, getUser, getReview,
  getSubmission, getAssignment, getFeedback, getEnrollment, getReviewGroups, getGroupDetails,
  getCourses, getAssignments, getAssignmentsWithSubmissions, getInstructorID, getAllCourses,
  getAllAssignmentsStudent, getAllAssignmentsInstructor, getStudentSubmissions, getCoursesByStudentID,
  getAssignmentForStudentView, getSubmissionFile, getStudentsByName, getStudentsById, getStudentsInCourse,
  getCourseGroups
} from '../../src/db';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';

jest.mock('mysql2/promise');
jest.mock('fs/promises');

declare global {
  var pool: mysql.Pool;
}

describe('Database Functions', () => {
  let connection: mysql.PoolConnection;

  beforeAll(async () => {
    try {
      connection = await global.pool.getConnection();
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (connection) {
      connection.release();
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('createUser should insert a user and return the insertId', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
    const result = await createUser('John', 'Doe', 'john.doe@example.com', 'password', 'student');
    expect(result).toBe(1);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['John', 'Doe', 'john.doe@example.com', 'password', 'student']);
  });

  test('createStudent should insert a student', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    await createStudent(12345, 1);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [12345, 1]);
  });

  test('createInstructor should insert an instructor', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    await createInstructor(987654, 2, true);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [987654, 2, true]);
  });

  test('addAssignmentToCourse should insert an assignment', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{ count: 1 }]);
    await addAssignmentToCourse('Title', 'Description', '2023-12-31', 'file.pdf', true, 1, ['pdf']);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['Title', 'Description', expect.any(Date), 'file.pdf', true, 1, 'pdf']);
  });

  test('selectStudentForSubmission should insert a student into student_groups', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    await selectStudentForSubmission(12345, 1, 1, 2);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String));
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [12345, 1, 1, 2]);
  });

  test('createCourse should insert a course and return the insertId', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{ insertId: 1 }]);
    const result = await createCourse('Course Name', 1);
    expect(result).toBe(1);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['Course Name', 1]);
  });

  test('enrollStudent should insert a student into enrollment', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    await enrollStudent('12345', '1');
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['12345', '1']);
  });

  test('submitAssignment should insert a submission', async () => {
    const mockFile = {
      path: 'path/to/file',
      originalname: 'file.pdf',
      mimetype: 'application/pdf',
    };
    (fs.readFile as jest.Mock).mockResolvedValue(Buffer.from('file content'));
    (fs.unlink as jest.Mock).mockResolvedValue(undefined);
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    const result = await submitAssignment(1, 1, mockFile as any);
    expect(result).toEqual({ success: true, message: 'Assignment submitted successfully' });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 1, 'file.pdf', expect.any(Buffer), 'application/pdf']);
    expect(fs.readFile).toHaveBeenCalledWith('path/to/file');
    expect(fs.unlink).toHaveBeenCalledWith('path/to/file');
  });

  test('createReview should insert a review', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{ affectedRows: 1 }]);
    await createReview(1, true, 'pdf', new Date());
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, true, 'pdf', expect.any(Date)]);
  });

  test('addReviewCriteria should insert review criteria', async () => {
    const criteria = [{ criterion: 'Quality', maxMarks: 10 }];
    await connection.beginTransaction();
    await addReviewCriteria(1, criteria);
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 'Quality', 10]);
    await connection.commit();
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
  });

  test('selectStudentsForAssignment should insert students into selected_students', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    await selectStudentsForAssignment(1, ['1', '2'], '2023-12-31');
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 1, '2023-12-31']);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 2, '2023-12-31']);
  });

  test('createGroups should delete existing groups and insert new groups', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([{}]);
    const groups = [{ groupNumber: 1, studentIDs: [1, 2] }];
    await createGroups(groups, 1);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 1, 1]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 2, 1]);
  });

  test('getCourse should return a course by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ courseID: 1, courseName: 'Course Name', instructorID: 1 }]]);
    const result = await getCourse(1);
    expect(result).toEqual({ courseID: 1, courseName: 'Course Name', instructorID: 1 });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCourse should return undefined if the course does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getCourse(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getInstructor should return an instructor by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, instructorID: 1, isAdmin: true }]]);
    const result = await getInstructor(1);
    expect(result).toEqual({ userID: 1, instructorID: 1, isAdmin: true });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getInstructor should return undefined if the instructor does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getInstructor(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getReviewCriteria should return review criteria by review ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ criterion: 'Quality', maxMarks: 10 }]]);
    const result = await getReviewCriteria(1);
    expect(result).toEqual([{ criterion: 'Quality', maxMarks: 10 }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getReviewCriteria should return an empty array if the review criteria do not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getReviewCriteria(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudent should return a student by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, studentID: 12345 }]]);
    const result = await getStudent(12345);
    expect(result).toEqual({ userID: 1, studentID: 12345 });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudent should return undefined if the student does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getStudent(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getUser should return a user by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, firstName: 'John', lastName: 'Doe', email: 'johndoe@test.ca', role: 'student' }]]);
    const result = await getUser('1');
    expect(result).toEqual({ userID: 1, firstName: 'John', lastName: 'Doe', email: 'johndoe@test.ca', role: 'student' });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getUser should return undefined if the user does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getUser('1');
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getReview should return a review by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ reviewID: 1, submissionID: 1, isComplete: true, file: 'pdf', date: new Date() }]]);
    const result = await getReview(1);
    expect(result).toEqual({ reviewID: 1, submissionID: 1, isComplete: true, file: 'pdf', date: expect.any(Date) });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getReview should return undefined if the review does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getReview(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getSubmission should return a submission by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ submissionID: 1, assignmentID: 1, studentID: 1, file: 'pdf', date: new Date() }]]);
    const result = await getSubmission(1);
    expect(result).toEqual({ submissionID: 1, assignmentID: 1, studentID: 1, file: 'pdf', date: expect.any(Date) });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getSubmission should return undefined if the submission does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getSubmission(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignment should return an assignment by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title', description: 'Description', dueDate: new Date(), file: 'pdf', isGroup: true, courseID: 1 }]]);
    const result = await getAssignment(1);
    expect(result).toEqual({ assignmentID: 1, title: 'Title', description: 'Description', dueDate: expect.any(Date), file: 'pdf', isGroup: true, courseID: 1 });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignment should return undefined if the assignment does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAssignment(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getFeedback should return feedback by review ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ feedback: 'Feedback' }]]);
    const result = await getFeedback(1);
    expect(result).toEqual({ feedback: 'Feedback' });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getFeedback should return undefined if the feedback does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getFeedback(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getEnrollment should return an enrollment by student and course ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ studentID: 12345, courseID: 1 }]]);
    const result = await getEnrollment(12345, 1);
    expect(result).toEqual({ studentID: 12345, courseID: 1 });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [12345, 1]);
  });

  test('getEnrollment should return undefined if the enrollment does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getEnrollment(1, 1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1, 1]);
  });

  test('getReviewGroups should return review groups by assignment ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ studentID: 12345, assignmentID: 1 }]]);
    const result = await getReviewGroups(undefined,1);
    expect(result).toEqual([{ studentID: 12345, assignmentID: 1 }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getReviewGroups should return an empty array if the review groups do not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getReviewGroups(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  // test('getGroupDetails should return group details by group ID', async () => {
  //   (connection.execute as jest.Mock).mockResolvedValue([[{ groupID: 1, studentID: 1 }]]);
  //   const result = await getGroupDetails(1);
  //   expect(result).toEqual([{ groupID: 1, studentID: 1 }]);
  //   expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  // });

  // test('getGroupDetails should return an empty array if the group details do not exist', async () => {
  //   (connection.execute as jest.Mock).mockResolvedValue([[]]);
  //   const result = await getGroupDetails(1);
  //   expect(result).toEqual([]);
  //   expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  // });

  test('getCourses should return courses by instructor ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ courseID: 1, courseName: 'Course Name' }]]);
    const result = await getCourses();
    expect(result).toEqual([{courseID: 1, courseName: 'Course Name', isArchived: false, instructorID: 1}]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCourses should return an empty array if the courses do not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getCourses();
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignments should return assignments by course ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title' }]]);
    const result = await getAssignments();
    expect(result).toEqual([{ assignmentID: 1, title: 'Title', description: '', dueDate: expect.any(Date), file: '', isGroup: false, courseID: 1, rubric: '' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignments should return an empty array if the assignments do not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAssignments();
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });
  // might need to change this test
  test('getAssignmentsWithSubmissions should return assignments with submissions by course ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title' }]]);
    const result = await getAssignmentsWithSubmissions();
    expect(result).toEqual([{ assignmentID: 1, title: 'Title' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignmentsWithSubmissions should return an empty array if the assignments do not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAssignmentsWithSubmissions();
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getInstructorID should return an instructor ID by user ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ instructorID: 1 }]]);
    const result = await getInstructorID(1);
    expect(result).toBe(1);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getInstructorID should return undefined if the instructor ID does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getInstructorID(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAllCourses should return all courses', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ courseID: 1, courseName: 'Course Name' }]]);
    const result = await getAllCourses(false);
    expect(result).toEqual([{ courseID: 1, courseName: 'Course Name' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String));
  });

  test('getAllCourses should return an empty array if there are no courses', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAllCourses(false);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String));
  });

  test('getAllAssignmentsStudent should return all assignments for a student', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title' }]]);
    const result = await getAllAssignmentsStudent(1);
    expect(result).toEqual([{ assignmentID: 1, title: 'Title' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAllAssignmentsStudent should return an empty array if there are no assignments for a student', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAllAssignmentsStudent(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAllAssignmentsInstructor should return all assignments for an instructor', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title' }]]);
    const result = await getAllAssignmentsInstructor(1);
    expect(result).toEqual([{ assignmentID: 1, title: 'Title' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAllAssignmentsInstructor should return an empty array if there are no assignments for an instructor', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAllAssignmentsInstructor(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudentSubmissions should return all student submissions for an assignment', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ submissionID: 1, studentID: 1 }]]);
    const result = await getStudentSubmissions(1);
    expect(result).toEqual([{ submissionID: 1, studentID: 1 }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudentSubmissions should return an empty array if there are no student submissions for an assignment', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getStudentSubmissions(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCoursesByStudentID should return courses by student ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ courseID: 1, courseName: 'Course Name' }]]);
    const result = await getCoursesByStudentID(1);
    expect(result).toEqual([{ courseID: 1, courseName: 'Course Name' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCoursesByStudentID should return an empty array if there are no courses for a student', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getCoursesByStudentID(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignmentForStudentView should return an assignment for a student', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ assignmentID: 1, title: 'Title' }]]);
    const result = await getAssignmentForStudentView(1);
    expect(result).toEqual({ assignmentID: 1, title: 'Title' });
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getAssignmentForStudentView should return undefined if the assignment does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getAssignmentForStudentView(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getSubmissionFile should return a submission file by submission ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ file: 'pdf' }]]);
    const result = await getSubmissionFile(1);
    expect(result).toEqual('pdf');
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getSubmissionFile should return undefined if the submission file does not exist', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getSubmissionFile(1);
    expect(result).toBeUndefined();
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudentsByName should return students by name', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, firstName: 'John', lastName: 'Doe' }]]);
    const result = await getStudentsByName('John', 'Doe');
    expect(result).toEqual([{ userID: 1, firstName: 'John', lastName: 'Doe' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['John', 'Doe']);
  });

  test('getStudentsByName should return an empty array if there are no students by name', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getStudentsByName('John', 'Doe');
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), ['John', 'Doe']);
  });

  test('getStudentsById should return students by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, firstName: 'John', lastName: 'Doe' }]]);
    const result = await getStudentsById(1);
    expect(result).toEqual([{ userID: 1, firstName: 'John', lastName: 'Doe' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [[1]]);
  });

  test('getStudentsById should return an empty array if there are no students by ID', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getStudentsById(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [[1]]);
  });

  test('getStudentsInCourse should return students in a course', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ userID: 1, firstName: 'John', lastName: 'Doe' }]]);
    const result = await getStudentsInCourse(1);
    expect(result).toEqual([{ userID: 1, firstName: 'John', lastName: 'Doe' }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getStudentsInCourse should return an empty array if there are no students in a course', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getStudentsInCourse(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCourseGroups should return groups in a course', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[{ groupID: 1, groupNumber: 1 }]]);
    const result = await getCourseGroups(1);
    expect(result).toEqual([{ groupID: 1, groupNumber: 1 }]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });

  test('getCourseGroups should return an empty array if there are no groups in a course', async () => {
    (connection.execute as jest.Mock).mockResolvedValue([[]]);
    const result = await getCourseGroups(1);
    expect(result).toEqual([]);
    expect(connection.execute).toHaveBeenCalledWith(expect.any(String), [1]);
  });


});