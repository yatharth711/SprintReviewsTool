import React, { useState, useEffect } from 'react';
import { Card, CardBody, Button, Input, Textarea } from "@nextui-org/react";
import toast from "react-hot-toast";
import styles from "../../../styles/student-group-details.module.css";

interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
}

interface StudentGroupDetailsProps {
  groupID: number;
  students: Student[];
  assignmentID: number;
  userID: number;
  isFeedbackSubmitted: boolean;
}

interface Feedback {
  revieweeID: number;
  score: string;
  content: string;
}

const StudentGroupDetails: React.FC<StudentGroupDetailsProps> = ({
  groupID,
  students,
  assignmentID,
  userID,
  isFeedbackSubmitted: initialIsFeedbackSubmitted,
}) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(
    students.map((student) => ({
      revieweeID: student.studentID,
      score: '',
      content: '',
    }))
  );
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(
    initialIsFeedbackSubmitted
  );

  useEffect(() => {
    setIsFeedbackSubmitted(initialIsFeedbackSubmitted);
  }, [initialIsFeedbackSubmitted]);

  const handleInputChange = (revieweeID: number, field: string, value: string) => {
    let validatedValue = value;
    if (field === 'score') {
      validatedValue = Math.floor(Number(value)).toString();
      const numericValue = Number(value);
      if (numericValue < 0) {
        validatedValue = '0';
        toast.error('Score cannot be less than 0.');
      } else if (numericValue > 10) {
        validatedValue = '10';
        toast.error('Score cannot be greater than 10.');
      }
    }
    setFeedbacks((prevFeedbacks) =>
      prevFeedbacks.map((feedback) =>
        feedback.revieweeID === revieweeID
          ? { ...feedback, [field]: validatedValue }
          : feedback
      )
    );
  };

  const handleSubmit = async () => {
    const incompleteFeedback = feedbacks.find(feedback => feedback.score === '' || feedback.content === '');
    if (incompleteFeedback) {
      toast.error('Please fill in both score and content for all group members.');
      return;
    }

    if (!isFeedbackSubmitted) {
      await submitFeedback();
    } else {
      await updateFeedback();
    }
  };

  const submitFeedback = async () => {
    try {
      const response = await fetch('/api/groups/submitGroupFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentID,
          reviewerID: userID,
          feedbacks,
        }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully.');
        setIsFeedbackSubmitted(true);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Error submitting feedback. Please try again.');
    }
  };

  const updateFeedback = async () => {
    try {
      const response = await fetch('/api/updateTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'groupFeedback',
          data: feedbacks.map((feedback) => ({
            assignmentID,
            content: feedback.content,
            score: feedback.score,
            reviewerID: userID,
            revieweeID: feedback.revieweeID,
          })),
        }),
      });

      if (response.ok) {
        toast.success('Feedback updated successfully.');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Error updating feedback. Please try again.');
    }
  };

  return (
    <Card>
      <CardBody>
        <h3>Group: {groupID}</h3>
        <br />
        <h3>Group Members:</h3>
        <ul className={styles.groupList}>
          {students.map((student) => (
            <li key={student.studentID} className={styles.groupMemberItem}>
              <div className={styles.groupMember}>
                  <span>{student.firstName} {student.lastName}</span>
                  <Input
                  type="number"
                  placeholder="Score"
                  className={styles.scoreInput}
                  value={feedbacks.find(feedback => feedback.revieweeID === student.studentID)?.score}
                  min={0}
                  max={10}
                  onChange={(e) => handleInputChange(student.studentID, 'score', e.target.value)}
                />
              </div>
              <Textarea
                placeholder="Additional comments"
                value={feedbacks.find(feedback => feedback.revieweeID === student.studentID)?.content}
                onChange={(e) => handleInputChange(student.studentID, 'content', e.target.value)}
              />
              <br />
            </li>
          ))}
        </ul>
      </CardBody>
      <Button onPress={handleSubmit} className={isFeedbackSubmitted ? "text-primary-900 text-large font-bold bg-success-300 my-2 p-1" : ""}>
        {isFeedbackSubmitted ? 'Re-Submit Feedback' : 'Submit Feedback'}
      </Button>
    </Card>
  );
};

export default StudentGroupDetails;