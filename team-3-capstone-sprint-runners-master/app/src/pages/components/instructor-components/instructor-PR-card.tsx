import { useRouter } from "next/router";
import React from 'react';
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import styles from '../../../styles/instructor-components.module.css';


interface InstructorReviewCardProps {
  reviewID: number;
  title: string;
  linkedAssignmentID: string;
  deadline: string;
  color: string;
}

export default function InstructorReviewCard({ reviewID, linkedAssignmentID, title, deadline, color }: InstructorReviewCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/instructor/peer-review-dashboard?reviewID=${reviewID}`);
  };

  return (
    <Card shadow="sm" className={`${styles.outerCard}`} isPressable onPress={handleClick}>
    <CardBody className="overflow-visible p-0">
    </CardBody>
    <CardFooter className="text-small justify-between" style={{ backgroundColor: color }}>
      <b>Reviewing: {title}</b>
      <p>{deadline}</p>
    </CardFooter>
  </Card>
  );
}
