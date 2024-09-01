import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import styles from "../../../styles/student-group-details.module.css";

interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
}

interface Feedback {
  revieweeID: number;
  reviewerID: number;
  score: string;
  content: string;
}

interface StudentGroupDetailsProps {
  groupID: number;
  studentName: string | undefined;
  students: Student[];
  feedbacks: Feedback[];
}

const InstructorGroupFeedback: React.FC<StudentGroupDetailsProps> = ({ groupID, studentName, students, feedbacks }) => {
  return (
    <Card>
      <CardBody>
        <h3>Group: {groupID}</h3>
        <h3>{studentName}</h3>
        <br />
        <h3>Group Members:</h3>
        <ul className={styles.groupList}>
          {students.map(student => {
            const feedback = feedbacks.find(fb => fb.reviewerID === student.studentID);
            return (
              <li key={student.studentID} className={styles.groupMemberItem}>
                <div className={styles.groupMember}>
                  <span>{student.firstName} {student.lastName}</span>
                </div>
                <span className={styles.feedbackScore}>Given Score: {feedback?.score || 'N/A'}</span>
                <p className={styles.feedbackContent}>Given Feedback: {feedback?.content || 'N/A'}</p>
                <br />
              </li>
            );
          })}
        </ul>
      </CardBody>
    </Card>
  );
};

export default InstructorGroupFeedback;
