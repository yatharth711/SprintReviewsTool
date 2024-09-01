// student-course-assignment-card.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, CardFooter } from '@nextui-org/react';
import style from '../../../styles/student-components.module.css';

interface StudentAssignmentCardProps {
  courseID: number;
  assignmentName: string;
  color: string;
  deadline: string;
  groupAssignment: boolean;
}

const StudentAssignmentCard: React.FC<StudentAssignmentCardProps> = ({ courseID, assignmentName, color, deadline, groupAssignment }) => {
  const router = useRouter();

  const handleClick = () => {
    if (groupAssignment) {
      router.push(`/student/group-assignment-dashboard?assignmentID=${courseID}`);
    } else {
      router.push(`/student/assignment-dashboard?assignmentID=${courseID}`);
    }
  };

  return (
    <Card shadow="sm" className={`${style.outerCard}`} isPressable onPress={handleClick}>
      <CardBody className="overflow-visible p-0">
      </CardBody>
      <CardFooter className="text-small justify-between" style={{ backgroundColor: color }}>
        <b>{assignmentName}</b>
        <p>{deadline}</p>
      </CardFooter>
    </Card>
  );
};

export default StudentAssignmentCard;
