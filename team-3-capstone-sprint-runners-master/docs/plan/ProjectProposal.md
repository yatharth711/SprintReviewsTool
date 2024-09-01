
# Project Proposal for Project #3

**Project Title:** Peer-Review Application

**Team Number:** 3

**Team Members:** Brendan Michaud, Divyajot Kaur, Eric Harrison, Tithi Soni, Yatharth Mathur

## Overview

### Project purpose and UVP

#### Project Purpose

The purpose of this software is to create a user-friendly platform aimed at simplifying the assignment submission and evaluation processes for students and instructors. More specifically, the software will be catered towards peer evaluation as it will allow instructors to set assignments to be peer-reviewed by a predetermined number of other students, and it will provide easy access for students to both submit and receive feedback from other students.

#### Unique Value Proposition

* User Friendliness
  * The platform will provide an intuitive interface for instructors, allowing easy access to create assignments, manage student progress and oversee the peer review process.
  * It will provide a simple assignment submission process for students, making it effortless for them to submit their work and receive prompt feedback and progress reports.

* Integrated Peer Review Process
  * The software will allow for an easy, user-friendly, method of integrating peer review into the assignments.
  * Instructors can create groups within the platform, enabling an easy method for group assignments and allowing students to easily provide anonymous feedback to the other students within their group.

* Scalability
  * Since the software will be developed with the React framework, it allows for easy integration of further software at later dates.

#### Why Our Solution is Better

Our product stands out due to its user-centric design. Unlike existing solutions, our product is catered around peer reviews, allowing for a fair and simple integration of the peer review process for both instructors and students. Overall, this ensures a seamless, efficient, and collaborative educational experience for all users.

### High-Level Project Description and Boundaries

Minimum Viable Product (MVP):

* A platform for instructors to select their institution and create and manage classes and assignments.
* Incorporation of a robust peer review process where students can anonymously review each other's work.
* Secure user authentication and account management for students and instructors.
* A personalized dashboard for instructors to monitor student progress and feedback.
* A personalized dashboard for students to view submitted assignments, peer reviews, feedback received, and progress.
* An efficient submission system for students to allow them to upload their assignments easily.

Boundaries:

* All peer reviews will be anonymous to ensure fairness.
* The system will support assignment submissions in terms of selected file formats: .TXT, .DOC, .PDF, and .ZIP
* The initial deployment of the system will support a limited number of classes and students considering the short development period.
* The platform will only be optimized for desktop and mobile use.

### Measurable Project Objectives and Related Success Criteria (Scope of Project)

The goal of this project is to create an easy-to-use, online platform for students and instructors to effectively evaluate assignment submissions through peer review. Students will be able to submit assignments and receive anonymous feedback from a designated number of other students. Evaluations will support both feedback for individual and group assignments, determined by the instructor. The application will allow instructors to easily create and manage classes, add and determine evaluation criteria for assignments, and monitor student progress. This process will promote collaboration, accountability, student development, and simple evaluation by anonymous peer review.

Users will be able to easily create new accounts, or log in to existing accounts by providing authentication. Instructors and administrators will be able to create classes and assign students to the classroom using csv files or manual entry. Student accounts will be linked only to classes assigned by instructors, and able to review selected peer assignments. The application will support compatibility with mobile or desktop devices, allow all users to efficiently upload files from a set number of file types (txt, doc, pdf, and zip) as well as links. The project will also provide simple site navigation using a minimalistic interface.

The application will be built using React as well as a relational database to provide flexibility to users and enable future scalability to the system. This project is intended to support a few classes, given the limited development period of 3 months. With rigorous testing and iterative development, the application will be deployed with the required functionality in August 2024.

## Users, Usage Scenarios and High-Level Requirements

### Users Groups

1. **Instructors:** Instructors, as our main users, are tasked with forming classroom groups, devising peer-review assignments, and optionally, creating student subgroups within the classroom. They aim to utilize a user-friendly platform, support an easily administrable grading system, and incorporate an anonymous peer review mechanism.
&nbsp;

2. **Students:** Students, who are also our main users, utilize the system to submit and anonymously review assignments. This includes offering feedback and adhering to an instructor-provided rubric for peer evaluation. Their objective is to engage with a system that facilitates easy assignment submission, provides peer feedback, and offers insights, all while assisting instructors by reviewing the work of their peers.  
&nbsp;

3. **Administrators:** Administrators are users who have a purely technical support system that enables them to manage and maintain the software. Their objective is to have exclusive access to the instructor and student pages, along with the ability to create and delete user profiles and classrooms. Additionally, they receive analytics that includes data on online and offline users, as well as the operational status of the system, indicating whether it is running or under maintenance.  

### Envisioned Usage

1. **Instructor:**
Here is a list of user scenarios for instructors as one of the primary users:
    * **Scenario 1:** The instructor wants to create a new classroom group.
        * The instructor logs into their instructor-level account and navigates to "Create Classroom", a page where they have a form to create classrooms.
        * They fill in their name, classroom description, and classroom number.
        * They subsequently compile a list of students in their classroom into a .csv file format. These students are the recipients of classroom invitations via a shared link. The instructor has the discretion to distribute these invitations as they see fit.
        * The platform facilitates student participation in the instructor’s classroom, and concurrently, the instructor is notified when students join their classroom.
    * **Scenario 2:** The instructor wants to monitor student progress and conduct peer reviews.
        * The instructor can view the grades and evaluation dashboard for each student in their respective classrooms
        * The instructor can also upload the student's files and provide the rubric of evaluation with the file, the system shall randomly assign the assignment to be reviewed by the students.
    * **Journey Line:**  Here is a potential journey line for instructors:
        1. The instructor logs into their instructor account.
        1. They navigate to Create Classroom (if a new classroom is to be created) or go to the Classroom Group (which is identified by a classroom number and name).
        1. Additionally, the instructor can go to "Create Classroom Teams," which creates a group of students within their respective classrooms.
        1. The instructor uploads the assignments and clicks distribute.
        1. They are led to the option of choosing the number of students to include in the evaluation and sending the assignment at random to the set number of students defined.

2. **Student:**
Here is a list of user scenarios for our students as primary users:
    * **Scenario 1:** The student wants to submit an assignment to its respective classroom(s) and perform peer review evaluations
        * The student logs into their student account to view their pending assignments and peer reviews.
        * They upload their assignments as per the rubrics provided
        * They open their review assignment, which provides the classroom in which the assignment review needs to be conducted based on another set of rubrics

    * **Journey Line:** Here is a potential journey line for students:
        * The student logs into their student account.
        * They will submit assignments by uploading their assignments into the respective submissions boxes made on the "Assignments and Submission" page
        * They will then also have to open the "Peer Evaluation" section to follow the peer reviews assigned to them and follow the rubric provided by the instructor.
        * Additionally, they can review their grades and performances on the "Grades Dashboard", which gives them grades and feedback on each assignment

3. **Administrators:**
Here is a list of user scenarios for Administrators as primary users:
    * **Scenario and Journey Line**: Maintain the system and ensure a smooth flow of software usage.
        * They are to log in through the admin portal, separate from the other login formats.
        * They are privy to daily analytics of the application, including data on users who are online
        * They also have “view only” access to the accounts of instructors and students
        * They can also create user profiles and remove user profiles

### Requirements

**Functional Requirements:**

1. User Management
    * Registration and login system for students, instructors, and administrators
    * User roles and permissions based on the type of user
    * Profile management- users can see and update personal information.
2. Class and Assignment Management
    * Instructors can create, update, and delete classes
    * Instructors can set parameters for assignments
        1. Deadlines, group members, and rubrics as required
3. Assignment Submission and Review
    * Students can submit assignments
    * Students can review peer assignments that are assigned to them by the instructor
    * Student information is not available for assignments that will be reviewed by peers, to maintain anonymity and fairness
4. Evaluation and Feedback
    * Instructors can review and provide feedback for assignments
    * Students can review and provide feedback on their peers’ assignments
    * Students can view feedback and grades on their assignments
5. Performance Tracking
    * Instructors can track individual student performance and overall class performance
6. Security
    * Secure authentication and authorization of user profiles
    * Data encryption to protect the personal information of users
7. System Management
    * Administrators can manage the overall system, including user management and system settings
8. User Interface
    * Interface is user-friendly and easy to navigate for all user types
    * Responsive design that will support desktop and mobile devices

**Non-functional Requirements:**

1. Performance
    * The system should handle concurrent peer reviews efficiently, allowing multiple users to submit and review papers simultaneously
    * Response time for loading forms and documents should be less than 2 seconds to maintain a seamless user experience
2. Security
    * User authentication and authorization mechanisms must be robust to prevent unauthorized access to sensitive data
    * All communication between users and the system should be encrypted using industry-standard protocols (HTTPS)
    * The application should have role-based access control to manage permissions for authors, reviewers, and administrators
3. Reliability
    * The system should have a high uptime, with a target availability of 99.9%
    * Regular backups of review data should be performed to prevent data loss
4. Usability
    * The user interface should be intuitive and user-friendly, allowing reviewers to easily navigate through the application
    * Clear error messages and helpful tooltips should guide users during form submissions
    * Accessibility standards should be followed to accommodate users with disabilities
5. Scalability
    * The application should handle an increasing number of users and reviews without performance degradation.
6. Maintainability
    * The code should follow best practices and be well-documented
    * Regular code reviews and refactoring should be part of the development process
7. Compatibility
    * The application should work seamlessly across different browsers and mobile/desktop devices

**User Requirements:**

1. Students
    1. Submit assignments
    2. Review and provide feedback on assignments from their peers as directed by the instructor
    3. View feedback on their assignments
    4. Provide feedback on peers’ contributions in group assignments anonymously
2. Instructors
    1. Create, manage, and delete classes and related assignments and data.
    2. Set parameters for assignments: deadlines, groups for peer reviews, and assignment details/rubrics
    3. Oversee assignments, create evaluations, and monitor student progress
    4. Have a comprehensive view of student progress and performance
3. Administrator
    1. Manage overall systems: user management, course management and system settings
4. All users
    1. Register and log in to the system
    2. View and update personal information
    3. Access the system on any device

**Technical Requirements:**

1. Software Requirements
    1. The application should be developed using React
    2. The system should support a database that is efficient at handling storage and data retrieval
2. System Design
    1. System architecture should be designed to support multiple user roles and their respective functionalities
    2. UI/UX should be intuitive and user-friendly, maintaining a seamless experience for all users
3. Programming Code
    1. The backend code should be robust, secure, and efficient
    2. Code should follow best practices for readability, maintainability, and scalability
4. Testing
    1. Application should undergo rigorous testing, including verification and validation
    2. Peer review of code should be conducted to identify defects and improvements
5. Deployment and Maintenance
    1. The application should be deployable on various platforms and environments
    2. Regular updates and maintenance should be planned to ensure the application remains up-to-date and secure
6. Integration
    1. The application should support integration with other systems as required by the client
7. Data Management
    1. The system should support efficient data management practices, including regular backups, data validation, and data security measures
8. Documentation
    1. Comprehensive documentation should be maintained for the system design, code, user manual, and other technical aspects of the application.
  
## Tech Stack*
Technologies that will be used to build the platform:

| Type | Technology | Justification |
|-------------|-------------|-------------|
| Front-end | React | React allows the building of complex applications with flexibility. It allows code reusability. It allows component-driven development. We can create a user interface and break it into reusable components allowing ease of development |
|  | HTML/CSS | Fundamental technologies for web development. |
| Back-end | Node.js | Non-blocking, event-driven architecture ideal for scalable network applications. |
|| NextJs | React-based framework used for creating static websites and SEO optimizations. |
| Database | MySQL | Flexible and scalable database that stores data in JSON-like documents. |
| Authentication | JWT | Allows secure, stateless authentication and authorization. |
| Development platforms and tools for collaboration | VS Code | Powerful code editor with extensive support for JavaScript and Node.js. |
|  | Git & GitHub | Version control and collaboration platform for tracking code changes and facilitating teamwork. |
| API | RESTful API, Google API | Standard architectural style for designing easy-to-use networked applications using HTTP requests. |

*Subject to change

## High-level risks

Description and analysis of identified risks associated with the project:

* Scalability Issues
  * The system may not be able to scale to handle a larger number of users
* Security and Privacy
  * There could be data breaches and potential unauthorized access to the personal information of users.
* Technical Debt
  * Continuous and rapid development given the short period could result in code being difficult to maintain.
* Deadline Compliance
  * Short development period may not be enough to deliver all features
* UX Design Issues
  * The design of the platform developed may fail to be user-friendly impairing user experience.
* Regulatory Compliance
  * The platform may fail to comply with educational regulations and data protection laws.
* Performance Issues
  * The platform may experience downtime and slow response time with heavy traffic.
* Communication and Collaboration Challenges
  * There could be possible miscommunication and the absence of strong collaboration between team members.

| Risk ID | Risk Description                       | Impact | Probability |
|---------|----------------------------------------|--------|-------------|
| 1       | Scalability issues                     | High   | Medium      |
| 2       | Security and Privacy                   | High   | Medium      |
| 3       | Technical Debt                         | High   | Medium      |
| 4       | Missing deadlines (Deadline compliance)| High   | Medium      |
| 5       | Low user adoption                      | Medium | High        |
| 6       | Poor user experience (UX)              | Medium | Medium      |
| 7       | Regulatory compliance issues           | High   | Low         |
| 8       | Performance issues during peak usage   | High   | Medium      |
| 9       | Communication and collaboration issues | Medium | Medium      |

## Assumptions and constraints

### **Project Assumptions**
* All intended libraries and APIs to use are free and fully open-source
* APIs needed/wanted exist and are usable
* The given requirements are accurate to the clients based on the initial project description
* All team members are able to operate the necessary components of the tech stack on their machine
* The final submitted project is a operational prototype, and may not be fully-developed deployable software without continued development
* Every team member will provide equal contribution to the final product
* All elements of our chosen tech stack will be openly available and able to be integrated together
* New technology will be learned by all team members, creating code issues that will be continously resolved

### **Project Constraints**
* The greatest constraint is the lack of financial budget, meaning all APIs and libraries will need to be free open source software
* Heavy time constraints restrict us from building new APIs that may be included from scratch
* Lack of time also means a shortened planning and development process, limiting the ability for extra features
* Possible hardware constraints, limiting the scalability testing and server deployment
* Time also creates workload constraints, impacted by the number of team members as well. Thus the breakdown of feature development is limited in size.
* Outside of financial, hardware, and time constraints there may be interpersonal constraints presented during development, possibly delaying the project progress
* A short development period means that if major issues occur, requirements may not be met, and reworking will be needed to produce a complete application by the deadline

## Summary milestone schedule

Identify the major milestones in your solution and align them to the course timeline. In particular, what will you have ready to present and/or submit for the following deadlines? List the anticipated features you will have for each milestone, and we will help you scope things out in advance and along the way. Use the table below and just fill in the appropriate text to describe what you expect to submit for each deliverable. Use the placeholder text in there to guide you on the expected length of the deliverable descriptions. You may also use bullet points to clearly identify the features associated with each milestone (which means your table will be lengthier, but that’s okay).  The dates are correct for the milestones.  

|  Milestone  | Deliverable |
| :-------------: | ------------- |
|  May 29th  | Project Plan Submission |
| May 29th  | A short video presentation describing the user groups and requirements for the project.  This will be reviewed by your client and the team will receive feedback. |
| June 5th  | Design Submission: Same type of description here. Aim to have a design of the project and the system architecture planned out. Use cases need to be fully developed.  The general user interface design needs to be implemented by this point (mock-ups). This includes having a consistent layout, colour scheme, text fonts, etc., and showing how the user will interact with the system should be demonstrated. It is crucial to show the tests pass for your system here. |
| June 5th  |  A short video presentation describing the design for the project.  This will be reviewed by your client and the team will receive feedback. |
| June 14th  | Mini-Presentations: A short description of the parts of the envisioned usage you plan to deliver for this milestone. Should not require additional explanation beyond what was already in your envisioned usage. This description should only be a few lines of text long. Aim to have 3 features working for this milestone (e.g., user log-in with credentials and permissions counts as 1 feature). Remember that features also need to be tested.  |
| July 5th  | MVP Mini-Presentations: A short description of the parts of the envisioned usage you plan to deliver for this milestone. Should not require additional explanation beyond what was already in your envisioned usage. This description should only be a few lines of text long. Aim to have close to 50% of the features working for this milestone.  Remember that features also need to be tested. Clients will be invited to presentations.|
| July 19th  | Peer testing and feedback: Aim to have an additional two features implemented and tested **per** team member. As the software gets bigger, you will need to be more careful about planning your time for code reviews, integration, and regression testing. |
| August 2nd  | Test-O-Rama: Full-scale system and user testing with everyone |
| August 9th  |  Final project submission and group presentions: Details to follow |

## Teamwork Planning and Anticipated Hurdles

Based on the teamwork icebreaker survey, talk about the different types of work involved in a software development project. Start thinking about what you are good at as a way to get to know your teammates better. At the same time, know your limits so you can identify which areas you need to learn more about. These will be different for everyone. But in the end, you all have strengths and you all have areas where you can improve. Think about what those are, and think about how you can contribute to the team project. Nobody is expected to know everything, and you will be expected to learn (just some things, not everything).
Use the table below to help line up everyone’s strengths and areas of improvement together. The table should give the reader some context and explanation about the values in your table.

For **experience** provide a description of a previous project that would be similar to the technical difficulty of this project’s proposal.  None, if nothing
For **good At**, list of skills relevant to the project that you think you are good at and can contribute to the project.  These could be soft skills, such as communication, planning, project management, and presentation.  Consider different aspects: design, coding, testing, and documentation. It is not just about the code.  You can be good at multiple things. List them all! It doesn’t mean you have to do it all.  Don’t ever leave this blank! Everyone is good at something!

|  Category  | Brendan Michaud | Divyajot Kaur | Eric Harrison | Tithi Soni | Yatharth Mathur |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
|  **Experience**  | COSC 310 - Security Surveillance System | COSC 310 - IClicker Clone | COSC 310 - Weather Dashboard | COSC 310- Canvas Clone, COSC 360- Discussion Forum | Internship - English Language Grading Tool with APIs |
|  **Good At**  | Project Management, Java/JS/PHP/Node/Python/SQL (MySQL primarily), De-bugging | Project Management, Java/PHP/JS/Python/MySQL, Front-end Development, Design  | Backend Development, SQL/Python/Java/Javascript/CSS/HTML, Time Management | Design- Figma, Planning, Coding(Java, Python, PHP, Javascript, HTML/CSS) | Backend with Node, SQL, PHP and Python; Front End with JavaScript, Flask,Android studios and Design with Figma |
|  **Expect to learn**  | React  | React, Copilot, Node | React, Node, Copilot | React, Node.js | React and advanced Node |

Use this opportunity to discuss with your team who **may** do what in the project. Make use of everyone’s skill set and discuss each person’s role and responsibilities by considering how everyone will contribute.  Remember to identify project work (some examples are listed below at the top of the table) and course deliverables (the bottom half of the table). You might want to change the rows depending on what suits your project and team.  Understand that no one person will own a single task.  Recall that this is just an incomplete example.  Please explain how things are assigned in the caption below the table, or put the explanation into a separate paragraph so the reader understands why things are done this way and how to interpret your table.

|  Category of Work/Features  | Brendan Michaud | Divyajot Kaur | Eric Harrison | Tithi Soni | Yatharth Mathur |
| ------------- | :-------------: | :-------------: | :-------------: | :-------------: | :-------------: |
|  **Project Management: Kanban Board Maintenance**  | :heavy_check_mark: | :heavy_check_mark: |  |  |  |
|  **System Architecture Design**  | :heavy_check_mark: | | :heavy_check_mark:  |  | :heavy_check_mark: |
|  **User Interface Design**  |  | :heavy_check_mark: |  | :heavy_check_mark: |  |
|  **Features**  | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
|  **Database setup**  | :heavy_check_mark: |  | :heavy_check_mark: |  | :heavy_check_mark: |
|  **Presentation Design**  |  | :heavy_check_mark: |  | :heavy_check_mark: |  |
|  **Design Video Creation**  |  | :heavy_check_mark:  |  |  | :heavy_check_mark: |
|  **Design Video Editing**  |  |  | :heavy_check_mark: | :heavy_check_mark: |  |
|  **Design Report**  | :heavy_check_mark:  |  |  |  |  |
|  **Final Video Creation**  |  | :heavy_check_mark: |  |  | :heavy_check_mark: |
|  **Final Video Editing**  |  |  | :heavy_check_mark: | :heavy_check_mark: |  |
|  **Final Team Report**  | :heavy_check_mark: |  |  |  |  |
|  **Final Individual Report**  |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |
=======
# Project Proposal for Project #3

**Team Number:** 3

**Team Members:** Brendan Michaud, Divyajot Kaur, Eric Harrison, Tithi Soni, Yatharth Mathur

## Overview:

### Project purpose or justification (UVP) - Eric

What is the purpose of this software? What problem does it solve? What is the unique value proposition? Why is your solution better than others?

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

### High-level project description and boundaries - Divya

Describe your MVP in a few statements and identify the boundaries of the system.

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

### Measurable project objectives and related success criteria (scope of project) - Brendan

Make sure to use simple but precise statement of goals for the project that will be included when it the project is completed.  Rememeber that goals must be clear and measurable and **SMART**.  It should be clearly understood what success means to the project and how the success will be measured (as a high level, what is success?). 

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

## Users, Usage Scenarios and High Level Requirements 

### Users Groups: - Yatharth
Provide a a descriotion of the primary users in the system and when their high-level goals are with the system (Hint: there is more than one group for most projects).  Proto-personas will help to identify user groups and their wants/needs. 

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

### Envisioned Usage - Yatharth
What can the user do with your software? If there are multiple user groups, explain it from each of their perspectives. These are what we called *user scenarios* back in COSC 341. Use subsections if needed to make things more clear. Make sure you tell a full story about how the user will use your software. An MVP is a minimal and viable, so don’t go overboard with making things fancy (to claim you’ll put in a ton of extra features and not deliver in the end), and don’t focus solely on one part of your software so that the main purpose isn’t achievable. Scope wisely.  Don't forget about journey lines to describe the user scenarios.  

Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Ut purus elit, vestibulum ut, placerat ac, adipiscing vitae, felis. Curabitur dictum gravida mauris. Nam arcu libero, nonummy eget, consectetuer id, vulputate a, magna. Donec vehicula augue eu neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris ut leo. Cras viverra metus rhoncus sem. Nulla et lectus vestibulum urna fringilla ultrices. Phasellus eu tellus sit amet tortor gravida placerat. Integer sapien est, iaculis in, pretium quis, viverra ac, nunc. Praesent eget sem vel leo ultrices bibendum. Aenean faucibus. Morbi dolor nulla, malesuada eu, pulvinar at, mollis ac, nulla. Curabitur auctor semper nulla. Donec varius orci eget risus. Duis nibh mi, congue eu, accumsan eleifend, sagittis quis, diam. Duis eget orci sit amet orci dignissim rutrum.

### Requirements: - Tithi
In the requirements section, make sure to clearly define/describe the **functional** requirements (what the system will do), **non-functional** requirements (performane/development), **user requirements (what the users will be able to do with the system and **technical** requirements).  These requirements will be used to develop the detailed uses in the design and form your feature list.
#### Functional Requirements:
- Describe the characteristics of the final deliverable in ordinary non-technical language
- Should be understandable to the customers
- Functional requirements are what you want the deliverable to do

#### Non-functional Requirements:
- Specify criteria that can be used to judge the final product or service that your project delivers
- List restrictions or constraints to be placed on the deliverable and how to build it; remember that this is intended to restrict the number of solutions that will meet a set of requirements.

#### User Requirements:
- Describes what the user needs to do with the system (links to FR)
- Focus is on the user experience with the system under all scenarios

#### Technical Requirements:
- These emerge from the functional requirements to answer the questions: 
-- How will the problem be solved this time and will it be solved technologically and/or procedurally?
-- Specify how the system needs to be designed and implemented to provide required functionality and fulfill required operational characteristics.
  
## Tech Stack

Identify the “tech stack” you are using. This includes the technology the user is using to interact with your software (e.g., a web browser, an iPhone, any smartphone, etc.), the technology required to build the interface of your software, the technology required to handle the logic of your software (which may be part of the same framework as the technology for the interface), the technology required to handle any data storage, and the programming language(s) involved. You may also need to use an established API, in which case, say what that is. (Please don’t attempt to build your API in this course as you will need years of development experience to do it right.) You can explain your choices in a paragraph, in a list of bullet points, or a table. Just make sure you identify the full tech stack.
For each choice you make, provide a short justification based on the current trends in the industry. For example, don’t choose an outdated technology because you learned it in a course. Also, don’t choose a technology because one of the team members knows it well. You need to make choices that are good for the project and that meet the client’s needs, otherwise, you will be asked to change those choices.  Consider risk analysis.

## High-level risks

Describe and analyze any risks identified or associated with the project.

## Assumptions and constraints

What assumptions is the project team making and what are the constraints for the project?

## Summary milestone schedule

Identify the major milestones in your solution and align them to the course timeline. In particular, what will you have ready to present and/or submit for the following deadlines? List the anticipated features you will have for each milestone, and we will help you scope things out in advance and along the way. Use the table below and just fill in the appropriate text to describe what you expect to submit for each deliverable. Use the placeholder text in there to guide you on the expected length of the deliverable descriptions. You may also use bullet points to clearly identify the features associated with each milestone (which means your table will be lengthier, but that’s okay).  The dates are correct for the milestones.  

|  Milestone  | Deliverable |
| :-------------: | ------------- |
|  May 29th  | Project Plan Submission |
| May 29th  | A short video presenation decribing the user groups and requirements for the project.  This will be reviewed by your client and the team will receive feedback. |
| June 5th  | Design Submission: Same type of description here. Aim to have a design of the project and the system architecture planned out. Use cases need to be fully developed.  The general user interface design needs to be implemented by this point (mock-ups). This includes having a consistent layout, color scheme, text fonts, etc., and showing how the user will interact with the system should be demonstrated. It is crucial to show the tests pass for your system here. |
| June 5th  |  A short video presenation decribing the design for the project.  This will be reviewed by your client and the team will receive feedback. |
| June 14th  | Mini-Presentations: A short description of the parts of the envisioned usage you plan to deliver for this milestone. Should not require additional explanation beyond what was already in your envisioned usage. This description should only be a few lines of text long. Aim to have 3 features working for this milestone (e.g., user log-in with credentials and permissions counts as 1 feature). Remember that features also need to be tested.  |
| July 5th  | MVP Mini-Presentations: A short description of the parts of the envisioned usage you plan to deliver for this milestone. Should not require additional explanation beyond what was already in your envisioned usage. This description should only be a few lines of text long. Aim to have close to 50% of the features working for this milestone.  Remember that features also need to be tested. Clients will be invited to presentations.|
| July 19th  | Peer testing and feedback: Aim to have an additional two features implemented and tested **per** team member. As the software gets bigger, you will need to be more careful about planning your time for code reviews, integration, and regression testing. |
| August 2nd  | Test-O-Rama: Full scale system and user testing with everyone |
| August 9th  |  Final project submission and group presentions: Details to follow |

## Teamwork Planning and Anticipated Hurdles
Based on the teamwork icebreaker survey, talk about the different types of work involved in a software development project. Start thinking about what you are good at as a way to get to know your teammates better. At the same time, know your limits so you can identify which areas you need to learn more about. These will be different for everyone. But in the end, you all have strengths and you all have areas where you can improve. Think about what those are, and think about how you can contribute to the team project. Nobody is expected to know everything, and you will be expected to learn (just some things, not everything).
Use the table below to help line up everyone’s strengths and areas of improvement together. The table should give the reader some context and explanation about the values in your table.

For **experience** provide a description of a previous project that would be similar to the technical difficulty of this project’s proposal.  None, if nothing
For **good At**, list of skills relevant to the project that you think you are good at and can contribute to the project.  These could be soft skills, such as communication, planning, project management, and presentation.  Consider different aspects: design, coding, testing, and documentation. It is not just about the code.  You can be good at multiple things. List them all! It doesn’t mean you have to do it all.  Don’t ever leave this blank! Everyone is good at something!

|  Category  | Brendan Michaud | Divyajot Kaur | Eric Harrison | Tithi Soni | Yatharth Mathur |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
|  **Experience**  | COSC 310 - Security Survailence System | 2 | COSC 310 - Weather Dashboard | COSC 310- Canvas Clone, COSC 360- Discussion Forum | 5 |
|  **Good At**  | Project Management, Java/JS/PHP/Node/Python/SQL (MySQL primarily),De-bugging | 2 | Backend Development, SQL/Python/Java/Javascript/CSS/HTML, Time Management | Design- Figma, Planning, Coding(Java, Python, PHP, Javascript, HTML/CSS) | 5 |
|  **Expect to learn**  | 1  | 2 | React, Node, Copilot | 4 | 5 |

Use this opportunity to discuss with your team who **may** do what in the project. Make use of everyone’s skill set and discuss each person’s role and responsibilities by considering how everyone will contribute.  Remember to identify project work (some examples are listed below at the top of the table) and course deliverables (the bottom half of the table). You might want to change the rows depending on what suits your project and team.  Understand that no one person will own a single task.  Recall that this is just an incomplete example.  Please explain how things are assigned in the caption below the table, or put the explanation into a separate paragraph so the reader understands why things are done this way and how to interpret your table.

|  Category of Work/Features  | Brendan Michaud | Divyajot Kaur | Eric Harrison | Tithi Soni | Yatharth Mathur || 
| ------------- | :-------------: | :-------------: | :-------------: | :-------------: | :-------------: | :-------------: |
|  **Project Management: Kanban Board Maintenance**  | :heavy_check_mark:  | :heavy_check_mark: |  |  |  |  | 
|  **System Architecture Design**  |  | :heavy_check_mark:  | :heavy_check_mark:  | :heavy_check_mark:  |  |  | 
|  **User Interface Design**  | :heavy_check_mark:  | :heavy_check_mark: |  |  |  |  | 
|  **CSS Development**  | :heavy_check_mark:  |  |  |  |  |  | 
|  **Feature 1**  |  |  |  |  |  |  | 
|  **Feature 2**  |  |  |  |  |  |  | 
|  **...**  |  |  |  |  |  |  | 
|  **Database setup**  | :heavy_check_mark: |  |  |  | :heavy_check_mark: |  | 
|  **Presentation Preparation**  | :heavy_check_mark:  |  |  | :heavy_check_mark:  |  |  | 
|  **Design Video Creation**  |  | :heavy_check_mark:  | :heavy_check_mark:  |  |  |  | 
|  **Design Video Editing**  | :heavy_check_mark:  | :heavy_check_mark:  |  |  |  |  | 
|  **Design Report**  | :heavy_check_mark:  |  |  |  |  |  | 
|  **Final Video Creation**  | :heavy_check_mark:  |  |  |  |  |  | 
|  **Final Video Editing**  | :heavy_check_mark:  |  |  |  |  |  | 
|  **Final Team Report**  |  | :heavy_check_mark:  |  |  |  |  | 
|  **Final Individual Report**  |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  :heavy_check_mark: |  | 

