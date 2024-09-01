// db.test.ts
import { query, createUser, getInstructorIDFromUserID, createInstructor, createStudent, authenticateAdmin, authenticateInstructor, authenticateStudent, getInstructorID, getAllCourses, addAssignmentToCourse, getAllAssignmentsStudent, getAllAssignmentsInstructor, getAssignments, getCourses, getAssignmentsWithSubmissions, getStudentSubmissions, getCoursesByStudentID, createCourse, getAssignmentForStudentView, submitAssignment, getSubmissionFile } from '../../src/db';

describe('Database Functions', () => {
  // Test the query function
  describe('query', () => {
    test('should execute the SQL query and return the result', async () => {
      const sql = 'SELECT * FROM users';
      const result = await query(sql);
      expect(result).toBeDefined();
    });
  });

  // Test the createUser function
  describe('createUser', () => {
    test('should create a new user in the database', async () => {
      const firstName = 'John';
      const lastName = 'Doe';
      const email = 'john.doe@example.com';
      const password = 'password123';
      const role = 'student';

      await createUser(firstName, lastName, email, password, role);

      // Assert that the user exists in the database
      const sql = 'SELECT * FROM user WHERE email = ?';
      const result = await query(sql, [email]);
      expect(result.length).toBe(1);
      expect(result[0].firstName).toBe(firstName);
      expect(result[0].lastName).toBe(lastName);
      expect(result[0].email).toBe(email);
      expect(result[0].pwd).toBe(password);
      expect(result[0].userRole).toBe(role);
    });
  });

  // Test the getInstructorIDFromUserID function
  describe('getInstructorIDFromUserID', () => {
    test('should return the instructor ID for a given user ID', async () => {
      const userID = 123;

      const instructorID = await getInstructorIDFromUserID(userID);

      expect(instructorID).toBeDefined();
      expect(typeof instructorID).toBe('number');
    });
  });

  // Test the createInstructor function
  describe('createInstructor', () => {
    test('should create a new instructor in the database', async () => {
      const instructorID = 456;
      const userID = 123;
      const isAdmin = true;

      await createInstructor(instructorID, userID, isAdmin);

      // Assert that the instructor exists in the database
      const sql = 'SELECT * FROM instructor WHERE instructorID = ?';
      const result = await query(sql, [instructorID]);
      expect(result.length).toBe(1);
      expect(result[0].instructorID).toBe(instructorID);
      expect(result[0].userID).toBe(userID);
      expect(result[0].isAdmin).toBe(isAdmin);
    });
  });

  // Test the createStudent function
  describe('createStudent', () => {
    test('should create a new student in the database', async () => {
      const studentID = 789;
      const userID = 123;

      await createStudent(studentID, userID);

      // Assert that the student exists in the database
      const sql = 'SELECT * FROM student WHERE studentID = ?';
      const result = await query(sql, [studentID]);
      expect(result.length).toBe(1);
      expect(result[0].studentID).toBe(studentID);
      expect(result[0].userID).toBe(userID);
    });
  });

  // Test the authenticateAdmin function
  describe('authenticateAdmin', () => {
    test('should return true if the admin authentication is successful', async () => {
      const email = 'admin@example.com';
      const password = 'admin123';

      const isAuthenticated = await authenticateAdmin(email, password);

      expect(isAuthenticated).toBe(true);
    });

    test('should return false if the admin authentication fails', async () => {
      const email = 'admin@example.com';
      const password = 'wrongpassword';

      const isAuthenticated = await authenticateAdmin(email, password);

      expect(isAuthenticated).toBe(false);
    });
  });

  // Test the authenticateInstructor function
  describe('authenticateInstructor', () => {
    test('should return true if the instructor authentication is successful', async () => {
      const email = 'instructor@example.com';
      const password = 'instructor123';

      const isAuthenticated = await authenticateInstructor(email, password);

      expect(isAuthenticated).toBe(true);
    });

    test('should return false if the instructor authentication fails', async () => {
      const email = 'instructor@example.com';
      const password = 'wrongpassword';

      const isAuthenticated = await authenticateInstructor(email, password);

      expect(isAuthenticated).toBe(false);
    });
  });

  // Test the authenticateStudent function
  describe('authenticateStudent', () => {
    test('should return true if the student authentication is successful', async () => {
      const email = 'student@example.com';
      const password = 'student123';

      const isAuthenticated = await authenticateStudent(email, password);

      expect(isAuthenticated).toBe(true);
    });

    test('should return false if the student authentication fails', async () => {
      const email = 'student@example.com';
      const password = 'wrongpassword';

      const isAuthenticated = await authenticateStudent(email, password);

      expect(isAuthenticated).toBe(false);
    });
  });

  // Test the getInstructorID function
  describe('getInstructorID', () => {
    test('should return the instructor ID for a given user ID', async () => {
      const userID = 123;

      const instructorID = await getInstructorID(userID);

      expect(instructorID).toBeDefined();
      expect(typeof instructorID).toBe('number');
    });

    test('should return null if no instructor is found for the given user ID', async () => {
      const userID = 456;

      const instructorID = await getInstructorID(userID);

      expect(instructorID).toBeNull();
    });
  });

  // Test the getAllCourses function
  describe('getAllCourses', () => {
    test('should return an array of courses', async () => {
      const isArchived = false;

      const courses = await getAllCourses(isArchived);

      expect(Array.isArray(courses)).toBe(true);
    });
  });

  // Test the addAssignmentToCourse function
  describe('addAssignmentToCourse', () => {
    test('should add a new assignment to the course', async () => {
      const title = 'Assignment 1';
      const description = 'This is assignment 1';
      const dueDate = '2022-01-01';
      const file = 'assignment1.pdf';
      const groupAssignment = false;
      const courseID = 123;
      const allowedFileTypes = ['pdf', 'docx'];

      await addAssignmentToCourse(title, description, dueDate, file, groupAssignment, courseID, allowedFileTypes);

      // Assert that the assignment exists in the database
      const sql = 'SELECT * FROM assignment WHERE title = ?';
      const result = await query(sql, [title]);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe(title);
      expect(result[0].descr).toBe(description);
      expect(result[0].deadline).toBe(dueDate);
      expect(result[0].rubric).toBe(file);
      expect(result[0].groupAssignment).toBe(groupAssignment);
      expect(result[0].courseID).toBe(courseID);
      expect(result[0].allowedFileTypes).toBe(allowedFileTypes.join(','));
    });
  });

  // Test the getAllAssignmentsStudent function
  describe('getAllAssignmentsStudent', () => {
    test('should return an array of assignments for a student', async () => {
      const userID = 123;

      const assignments = await getAllAssignmentsStudent(userID);

      expect(Array.isArray(assignments)).toBe(true);
    });
  });

  // Test the getAllAssignmentsInstructor function
  describe('getAllAssignmentsInstructor', () => {
    test('should return an array of assignments for an instructor', async () => {
      const userID = 123;

      const assignments = await getAllAssignmentsInstructor(userID);

      expect(Array.isArray(assignments)).toBe(true);
    });
  });

  // Test the getAssignments function
  describe('getAssignments', () => {
    test('should return an array of assignments', async () => {
      const assignments = await getAssignments();

      expect(Array.isArray(assignments)).toBe(true);
    });
  });

  // Test the getCourses function
  describe('getCourses', () => {
    test('should return an array of courses', async () => {
      const courses = await getCourses();

      expect(Array.isArray(courses)).toBe(true);
    });
  });

  // Test the getAssignmentsWithSubmissions function
  describe('getAssignmentsWithSubmissions', () => {
    test('should return an array of assignments with submissions', async () => {
      const assignments = await getAssignmentsWithSubmissions();

      expect(Array.isArray(assignments)).toBe(true);
    });
  });

  // Test the getStudentSubmissions function
  describe('getStudentSubmissions', () => {
    test('should return an array of student submissions for a given assignment ID', async () => {
      const assignmentID = 123;

      const submissions = await getStudentSubmissions(assignmentID);

      expect(Array.isArray(submissions)).toBe(true);
    });
  });

  // Test the getCoursesByStudentID function
  describe('getCoursesByStudentID', () => {
    test('should return an array of courses for a given student ID', async () => {
      const studentID = 123;

      const courses = await getCoursesByStudentID(studentID);

      expect(Array.isArray(courses)).toBe(true);
    });
  });

  // Test the createCourse function
  describe('createCourse', () => {
    test('should create a new course in the database', async () => {
      const courseName = 'Course 1';
      const instructorID = 123;

      const courseID = await createCourse(courseName, instructorID);

      expect(courseID).toBeDefined();
      expect(typeof courseID).toBe('number');
    });
  });

  // Test the getAssignmentForStudentView function
  describe('getAssignmentForStudentView', () => {
    test('should return the assignment details for a given assignment ID', async () => {
      const assignmentID = 123;

      const assignment = await getAssignmentForStudentView(assignmentID);

      expect(assignment).toBeDefined();
      expect(assignment.assignmentID).toBe(assignmentID);
    });
  });

  // Test the submitAssignment function
  describe('submitAssignment', () => {
    test('should submit an assignment for a student', async () => {
      const assignmentID = 123;
      const studentID = 456;
      const file = 'assignment.pdf';

      await submitAssignment(assignmentID, studentID, file);

      // Assert that the submission exists in the database
      const sql = 'SELECT * FROM submission WHERE assignmentID = ? AND studentID = ?';
      const result = await query(sql, [assignmentID, studentID]);
      expect(result.length).toBe(1);
      expect(result[0].assignmentID).toBe(assignmentID);
      expect(result[0].studentID).toBe(studentID);
      expect(result[0].fileName).toBe(file);
    });
  });

  // Test the getSubmissionFile function
  describe('getSubmissionFile', () => {
    test('should return the file content for a given submission ID', async () => {
      const submissionID = 123;

      const file = await getSubmissionFile(submissionID);

      expect(file).toBeDefined();
    });
  });
});