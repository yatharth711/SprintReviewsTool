// components/student-components/student-course
import React from 'react';
import { useRouter } from 'next/router';
import { Card, CardBody, CardFooter, Image } from '@nextui-org/react';
import style from '../../../styles/student-components.module.css';

interface StudentCourseCardProps {
    courseID: number;
    courseName: string;
    instructorName: string;
    color: string;
    img: string;
}

const StudentCourseCard: React.FC<StudentCourseCardProps> = ({ courseID, courseName, instructorName, color, img }) => {
    const router = useRouter();

    const handleClick = () => {
      router.push(`/student/course-dashboard?courseId=${courseID}`);
    };

    return (
        <Card shadow="sm" className={`${style.outerCard}`} isPressable onPress={handleClick}>
            <CardBody className="overflow-visible p-0">
        <Image
          shadow="sm"
          radius="lg"
          width="100%"
          alt={courseName}
          className="w-full object-cover h-[140px]"
          src={img}
        />
      </CardBody>
      <CardFooter className="text-small justify-between" style={{ backgroundColor: color }}>
        <b>{courseName}</b>
        <i>{instructorName}</i>
      </CardFooter>
        </Card>

    );

};

export default StudentCourseCard;