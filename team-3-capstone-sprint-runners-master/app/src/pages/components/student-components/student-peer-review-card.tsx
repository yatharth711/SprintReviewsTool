import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, CardFooter, Image } from '@nextui-org/react';
import style from '../../../styles/student-components.module.css';

interface StudentReviewCardProps {
  courseID: number;
  courseName: string;
  color: string;
  deadline: string;
}

const StudentReviewCard: React.FC<StudentReviewCardProps> = ({ courseID, courseName, color, deadline }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/student/review-dashboard?assignmentID=${courseID}`);
  };

  return (
    <Card shadow="sm" className={`${style.outerCard}`} isPressable onPress={handleClick}>
      <CardBody className="overflow-visible p-0">
      </CardBody>
      <CardFooter className="text-small justify-between" style={{ backgroundColor: color }}>
        <b>Reviewing: {courseName}</b>
        <p>{deadline}</p>
      </CardFooter>
    </Card>
  );
};

export default StudentReviewCard;