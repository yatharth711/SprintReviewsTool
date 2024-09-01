-- init.sql
-- script for initializing the db.
CREATE DATABASE IF NOT EXISTS mydb;
USE mydb;

DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS student;
DROP TABLE IF EXISTS instructor;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS assignment;
DROP TABLE IF EXISTS submission;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS group_feedback;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS selected_students;
DROP TABLE IF EXISTS review_criteria;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS review_groups;
DROP TABLE IF EXISTS course_groups;
DROP TABLE IF EXISTS instructor_feedback;

-- Table for storing users, which are separated into students and instructors
CREATE TABLE IF NOT EXISTS user (
    userID INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    email VARCHAR(100) UNIQUE,
    pwd VARCHAR(100),
    userRole VARCHAR(20) CHECK (userRole IN ('student', 'instructor'))
);

-- Table for storing student, connected to the user table
CREATE TABLE IF NOT EXISTS student (
    studentID INT PRIMARY KEY,
    userID INT NOT NULL,
    phoneNumber VARCHAR(15),
    homeAddress VARCHAR(255),
    dateOfBirth DATE,
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE
);

-- Table for storing instructor information, connected to the user table
CREATE TABLE IF NOT EXISTS instructor (
    instructorID INT PRIMARY KEY,
    userID INT NOT NULL,
    isAdmin BOOLEAN,
    departments VARCHAR(255),
    FOREIGN KEY (userID) REFERENCES user(userID) ON DELETE CASCADE
);

-- Table for storing courses
CREATE TABLE IF NOT EXISTS course (
    courseID INT AUTO_INCREMENT PRIMARY KEY,
    courseName VARCHAR(100),
    isArchived BOOLEAN,
    instructorID INT,
    FOREIGN KEY (instructorID) REFERENCES instructor(instructorID) ON DELETE SET NULL
);

-- Table for storing assignment information
CREATE TABLE IF NOT EXISTS assignment (
    assignmentID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    descr TEXT,
    rubric TEXT,
    startDate DATETIME,
    endDate DATETIME,
    deadline DATETIME,
    groupAssignment BOOLEAN,
    courseID INT NOT NULL,
    allowedFileTypes VARCHAR(255),
    FOREIGN KEY (courseID) REFERENCES course(courseID) ON DELETE CASCADE
);

-- Table for storing submission information between students and assignments
CREATE TABLE IF NOT EXISTS submission (
    submissionID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    studentID INT,
    fileName VARCHAR(255),
    fileContent LONGBLOB,
    fileType VARCHAR(100),
    submissionDate DATETIME,
    autoGrade DECIMAL(5, 2) DEFAULT 0,
    grade DECIMAL(5, 2),
    groupID INT,
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID) ON DELETE CASCADE,
    FOREIGN KEY (studentID) REFERENCES student(studentID) ON DELETE SET NULL
);

-- Review creation table for instructor
CREATE TABLE IF NOT EXISTS review_criteria (
    criteriaID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    criterion VARCHAR(255),
    maxMarks INT,
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID) ON DELETE CASCADE
);

-- Table for storing feedback information between students and assignments
CREATE TABLE IF NOT EXISTS feedback (
    feedbackID INT AUTO_INCREMENT PRIMARY KEY,
    revieweeID INT NOT NULL,
    assignmentID INT NOT NULL,
    feedbackDetails TEXT,
    feedbackDate DATETIME,
    lastUpdated DATETIME,
    comment TEXT NOT NULL,
    reviewerID INT,
    FOREIGN KEY (revieweeID) REFERENCES student(studentID) ON DELETE CASCADE,
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID) ON DELETE CASCADE
);

-- Table for storing feedback information between students for group assignments
CREATE TABLE IF NOT EXISTS group_feedback (
    groupFeedbackID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    score INT,
    content TEXT,
    reviewerID INT,
    revieweeID INT,
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID) ON DELETE CASCADE,
    FOREIGN KEY (reviewerID) REFERENCES student(studentID) ON DELETE SET NULL,
    FOREIGN KEY (revieweeID) REFERENCES student(studentID) ON DELETE SET NULL
);

-- Table for storing enrollment information to connect students to courses
CREATE TABLE IF NOT EXISTS enrollment (
    studentID INT,
    courseID INT,
    PRIMARY KEY (studentID, courseID),
    FOREIGN KEY (studentID) REFERENCES student(studentID) ON DELETE CASCADE,
    FOREIGN KEY (courseID) REFERENCES course(courseID) ON DELETE CASCADE
);

-- Table for storing selected students for a group assignment
CREATE TABLE IF NOT EXISTS selected_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT,
    studentID INT,
    uniqueDeadline DATETIME,
    FOREIGN KEY (assignmentID) REFERENCES submission(submissionID) ON DELETE CASCADE,
    FOREIGN KEY (studentID) REFERENCES student(studentID) ON DELETE SET NULL
);

-- Table for storing review information for peer review
CREATE TABLE IF NOT EXISTS review (
    reviewID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    isGroupAssignment BOOLEAN,
    allowedFileTypes VARCHAR(255),
    startDate DATETIME,
    endDate DATETIME,
    deadline DATETIME,
    anonymous BOOLEAN,
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID) ON DELETE CASCADE
);


-- Table for storing student notification preferences --
CREATE TABLE IF NOT EXISTS student_notifications (
    studentID INT,
    assignmentNotification BOOLEAN DEFAULT TRUE,
    reviewNotification BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (studentID) REFERENCES student(studentID) ON DELETE CASCADE
);


-- Table for storing connected submissions for students to peer review --

CREATE TABLE IF NOT EXISTS review_groups  (
    studentID INT,
    assignmentID INT,
    courseID INT,
    revieweeID INT,
    isReleased BOOLEAN DEFAULT false,
    autoReleaseDate DATETIME,
    PRIMARY KEY (studentID, revieweeID, assignmentID),
    FOREIGN KEY (studentID) REFERENCES student(studentID),
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID),
    FOREIGN KEY (courseID) REFERENCES course(courseID),
    FOREIGN KEY (revieweeID) REFERENCES student(studentID)
);


-- Table for storing course specific groups --
CREATE TABLE IF NOT EXISTS course_groups (
    groupID INT,
    studentID INT,
    courseID INT,
    PRIMARY KEY (groupID, studentID, courseID),
    FOREIGN KEY (studentID) REFERENCES student(studentID),
    FOREIGN KEY (courseID) REFERENCES course(courseID)
);

-- Table for storing instructor feedback on student submissions
CREATE TABLE IF NOT EXISTS instructor_feedback (
    feedbackID INT AUTO_INCREMENT PRIMARY KEY,
    assignmentID INT NOT NULL,
    courseID INT NOT NULL,
    studentID INT NOT NULL,        
    feedbackDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    comment TEXT,    
    FOREIGN KEY (assignmentID) REFERENCES assignment(assignmentID),
    FOREIGN KEY (courseID) REFERENCES course(courseID),
    FOREIGN KEY (studentID) REFERENCES student(studentID)
);

-- Insert a sample user (student) into the user table
INSERT INTO user (firstName, lastName, email, pwd, userRole)
VALUES ('John', 'Doe', 'john.doe@example.com', 'password123', 'student');

-- Get the userID of the newly inserted student
SET @userID = LAST_INSERT_ID();

-- Insert the student into the student table
INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth)
VALUES (123456, @userID, '1234567890', '123 Main St', '2000-01-01');

-- Insert a sample user (instructor) into the user table
INSERT INTO user (firstName, lastName, email, pwd, userRole)
VALUES ('Admin', 'Instructor', 'admin@gmail.com', 'password', 'instructor');

-- Get the userID of the newly inserted instructor
SET @userID = LAST_INSERT_ID();

-- Insert the instructor into the instructor table with isAdmin set to true
INSERT INTO instructor (instructorID, userID, isAdmin, departments)
VALUES (987654, @userID, true, 'Computer Science');

-- Insert a sample user (instructor) into the user table
INSERT INTO user (firstName, lastName, email, pwd, userRole)
VALUES ('Instructor', 'Sample', 'instructor@gmail.com', 'password', 'instructor');

-- Get the userID of the newly inserted instructor
SET @userID = LAST_INSERT_ID();

-- Insert the instructor into the instructor table with isAdmin set to false
INSERT INTO instructor (instructorID, userID, isAdmin, departments)
VALUES (876543, @userID, false, 'Computer Science');

-- Insert a sample course
INSERT INTO course (courseName, isArchived, instructorID)
VALUES ('COSC 499', false, 876543);

-- Get the courseID of the newly inserted course
SET @courseID = LAST_INSERT_ID();

-- Insert a sample assignment
INSERT INTO assignment (title, descr, rubric, startDate, endDate, deadline, groupAssignment, courseID, allowedFileTypes)
VALUES ('Final Project', 'Design a database schema', 'Design, Implementation, Report', '2024-11-21 23:59:59', '2024-12-05 23:59:59', '2024-12-01 23:59:59', false, @courseID, 'pdf,docx');

-- Get the assignmentID of the newly inserted assignment
SET @assignmentID = LAST_INSERT_ID();

-- Insert the student into the enrollment table
INSERT INTO enrollment (studentID, courseID)
VALUES (123456, @courseID);

-- Insert a sample submission
INSERT INTO submission (assignmentID, studentID, fileName, fileContent, fileType, submissionDate)
VALUES (@assignmentID, 123456, 'final_project.pdf', NULL, 'pdf', NOW());

-- Insert a sample feedback


-- Insert a sample review criteria
INSERT INTO review_criteria (assignmentID, criterion, maxMarks)
VALUES (@assignmentID, 'Design', 20);

-- Insert a sample selected student for a group assignment
INSERT INTO selected_students (assignmentID, studentID, uniqueDeadline)
VALUES (@assignmentID, 123456, '2024-12-05 23:59:59');

-- Insert 10 more students
INSERT INTO user (firstName, lastName, email, pwd, userRole) VALUES 
('Jane', 'Smith', 'jane.smith@example.com', 'password123', 'student'),
('Alice', 'Brown', 'alice.brown@example.com', 'password123', 'student'),
('Bob', 'Jones', 'bob.jones@example.com', 'password123', 'student'),
('Charlie', 'Davis', 'charlie.davis@example.com', 'password123', 'student'),
('David', 'Wilson', 'david.wilson@example.com', 'password123', 'student'),
('Eve', 'Clark', 'eve.clark@example.com', 'password123', 'student'),
('Frank', 'White', 'frank.white@example.com', 'password123', 'student'),
('Grace', 'Lewis', 'grace.lewis@example.com', 'password123', 'student'),
('Hank', 'Walker', 'hank.walker@example.com', 'password123', 'student'),
('Ivy', 'Hall', 'ivy.hall@example.com', 'password123', 'student');

-- Get the userIDs of the newly inserted students
SET @userID1 = LAST_INSERT_ID();
SET @userID2 = @userID1 + 1;
SET @userID3 = @userID1 + 2;
SET @userID4 = @userID1 + 3;
SET @userID5 = @userID1 + 4;
SET @userID6 = @userID1 + 5;
SET @userID7 = @userID1 + 6;
SET @userID8 = @userID1 + 7;
SET @userID9 = @userID1 + 8;
SET @userID10 = @userID1 + 9;

-- Insert the students into the student table
INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES
(123457, @userID1, '1234567891', '124 Main St', '2001-01-01'),
(123458, @userID2, '1234567892', '125 Main St', '2002-01-01'),
(123459, @userID3, '1234567893', '126 Main St', '2003-01-01'),
(123460, @userID4, '1234567894', '127 Main St', '2004-01-01'),
(123461, @userID5, '1234567895', '128 Main St', '2005-01-01'),
(123462, @userID6, '1234567896', '129 Main St', '2006-01-01'),
(123463, @userID7, '1234567897', '130 Main St', '2007-01-01'),
(123464, @userID8, '1234567898', '131 Main St', '2008-01-01'),
(123465, @userID9, '1234567899', '132 Main St', '2009-01-01'),
(123466, @userID10, '1234567800', '133 Main St', '2010-01-01');

-- Insert a new course connected to the admin account
INSERT INTO course (courseName, isArchived, instructorID)
VALUES ('Introduction to Databases', false, 987654);

-- Get the courseID of the newly inserted course
SET @newCourseID = LAST_INSERT_ID();

-- Insert a new assignment connected to the new course
INSERT INTO assignment (title, descr, rubric, startDate, endDate, deadline, groupAssignment, courseID, allowedFileTypes)
VALUES ('Database Project', 'Create a relational database', 'Schema, Queries, Report', '2024-10-25 23:59:59', '2024-11-03 23:59:59', '2024-11-01 23:59:59', true, @newCourseID, 'sql,docx');

-- Enroll the 10 additional students into the new course
INSERT INTO enrollment (studentID, courseID) VALUES
(123457, @newCourseID),
(123458, @newCourseID),
(123459, @newCourseID),
(123460, @newCourseID),
(123461, @newCourseID),
(123462, @newCourseID),
(123463, @newCourseID),
(123464, @newCourseID),
(123465, @newCourseID),
(123466, @newCourseID);

-- Insert 10 more students into the user table
INSERT INTO user (firstName, lastName, email, pwd, userRole) VALUES 
('Jack', 'Black', 'jack.black@example.com', 'password123', 'student'),
('Karen', 'Miller', 'karen.miller@example.com', 'password123', 'student'),
('Larry', 'Moore', 'larry.moore@example.com', 'password123', 'student'),
('Nancy', 'Green', 'nancy.green@example.com', 'password123', 'student'),
('Oscar', 'King', 'oscar.king@example.com', 'password123', 'student'),
('Paul', 'Scott', 'paul.scott@example.com', 'password123', 'student'),
('Rachel', 'Adams', 'rachel.adams@example.com', 'password123', 'student'),
('Steve', 'Johnson', 'steve.johnson@example.com', 'password123', 'student'),
('Tom', 'Carter', 'tom.carter@example.com', 'password123', 'student'),
('Uma', 'Taylor', 'uma.taylor@example.com', 'password123', 'student');

-- Get the userIDs of the newly inserted students
SET @userID11 = LAST_INSERT_ID();
SET @userID12 = @userID11 + 1;
SET @userID13 = @userID11 + 2;
SET @userID14 = @userID11 + 3;
SET @userID15 = @userID11 + 4;
SET @userID16 = @userID11 + 5;
SET @userID17 = @userID11 + 6;
SET @userID18 = @userID11 + 7;
SET @userID19 = @userID11 + 8;
SET @userID20 = @userID11 + 9;

-- Insert the students into the student table
INSERT INTO student (studentID, userID, phoneNumber, homeAddress, dateOfBirth) VALUES
(123467, @userID11, '1234567811', '134 Main St', '2011-01-01'),
(123468, @userID12, '1234567812', '135 Main St', '2012-01-01'),
(123469, @userID13, '1234567813', '136 Main St', '2013-01-01'),
(123470, @userID14, '1234567814', '137 Main St', '2014-01-01'),
(123471, @userID15, '1234567815', '138 Main St', '2015-01-01'),
(123472, @userID16, '1234567816', '139 Main St', '2016-01-01'),
(123473, @userID17, '1234567817', '140 Main St', '2017-01-01'),
(123474, @userID18, '1234567818', '141 Main St', '2018-01-01'),
(123475, @userID19, '1234567819', '142 Main St', '2019-01-01'),
(123476, @userID20, '1234567820', '143 Main St', '2020-01-01');

-- Enroll the 10 additional students into the new course
INSERT INTO enrollment (studentID, courseID) VALUES
(123467, @newCourseID),
(123468, @newCourseID),
(123469, @newCourseID),
(123470, @newCourseID),
(123471, @newCourseID),
(123472, @newCourseID),
(123473, @newCourseID),
(123474, @newCourseID),
(123475, @newCourseID),
(123476, @newCourseID);

-- Insert a submission for each of the newly added students for the new assignment
INSERT INTO submission (assignmentID, studentID, fileName, fileContent, fileType, submissionDate) VALUES
(@assignmentID, 123467, 'project_123467.sql', NULL, 'sql', NOW()),
(@assignmentID, 123468, 'project_123468.sql', NULL, 'sql', NOW()),
(@assignmentID, 123469, 'project_123469.sql', NULL, 'sql', NOW()),
(@assignmentID, 123470, 'project_123470.sql', NULL, 'sql', NOW()),
(@assignmentID, 123471, 'project_123471.sql', NULL, 'sql', NOW()),
(@assignmentID, 123472, 'project_123472.sql', NULL, 'sql', NOW()),
(@assignmentID, 123473, 'project_123473.sql', NULL, 'sql', NOW()),
(@assignmentID, 123474, 'project_123474.sql', NULL, 'sql', NOW()),
(@assignmentID, 123475, 'project_123475.sql', NULL, 'sql', NOW()),
(@assignmentID, 123476, 'project_123476.sql', NULL, 'sql', NOW());

