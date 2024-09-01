import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, CardFooter, Image } from '@nextui-org/react';
import style from '../../../styles/instructor-components.module.css';

interface InstructorAssignmentCardProps {
    courseID: number;
    assignmentName: string;
    color: string;
    deadline: string;
    groupAssignment: boolean;
}

const InstructorAssignmentCard: React.FC<InstructorAssignmentCardProps> = ({ courseID, assignmentName, color, deadline, groupAssignment }) => {
    const router = useRouter();

    const handleClick = () => {
        if (groupAssignment) {
            router.push(`/instructor/group-assignment-dashboard?assignmentID=${courseID}`);
          } else {
            router.push(`/instructor/assignment-dashboard?assignmentID=${courseID}`);
          }
    };

    return (
        <Card shadow="sm" className={`${style.outerCard}`} isPressable onPress={handleClick}>
            <CardBody className="overflow-visible p-0">
            </CardBody>
            <CardFooter className="text-small justify-between rounded-sm" style={{ backgroundColor: color }}>
                <b>{assignmentName}</b>
                <p>{deadline}</p>
            </CardFooter>
        </Card>
    );
};

export default InstructorAssignmentCard;