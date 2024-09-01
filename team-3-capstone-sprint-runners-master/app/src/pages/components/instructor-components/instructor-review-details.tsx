import React from 'react';
import { Card, CardBody } from "@nextui-org/react";
import styles from "../../../styles/AssignmentDetailCard.module.css";

interface ReviewDetailProps {
  title: string;
  description: string;
  deadline: string;
  startDate: string;
  endDate: string;
  //Something to have the review criteria shown here 
}

const ReviewDetailCard: React.FC<ReviewDetailProps> = ({
  title,
  description,
  deadline,
  startDate,
  endDate

}) => {
  return (
    
    <div className={styles.courseCards}>
      <Card className={styles.assignmentCard}>
        <CardBody>
          <h2 className={styles.assignmentTitle}>{title}</h2>
          <p className={styles.assignmentDescription}>{description}</p>
          <p className={styles.assignmentDeadline}>Deadline: {new Date(deadline).toLocaleString()}</p>
          <p className={styles.assignmentDeadline}> Start Date:  {new Date(startDate).toLocaleString()}</p>
          <p className={styles.assignmentDeadline}> End Date:  {new Date(endDate).toLocaleString()}</p>

        </CardBody>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailCard;
