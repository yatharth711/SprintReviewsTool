// student/dashboard.tsx
import React, { useState, useEffect } from 'react';
import StudentCourseCard from "../components/student-components/student-course";
import StudentNavbar from "../components/student-components/student-navbar";
import { useSessionValidation } from '../api/auth/checkSession';
import { useRouter } from 'next/router';
import { Spinner } from '@nextui-org/react';
import styles from '../../styles/student-dashboard.module.css';

interface Course {
  courseID: number;
  courseName: string;
  instructorFirstName: string;
  instructorLastName: string;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    console.log('Session updated:', session);
    if (session && session.user && session.user.userID) {
      console.log('Fetching courses for userID:', session.user.userID);
      fetchCourses(session.user.userID);
    }
  }, [session]);

  
  const fetchCourses = async (userID: number) => {
    try {
      const response = await fetch(`/api/getCoursesByStudent?userID=${userID}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] student flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>;
  }

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }


  return (
    <>
      

      <div className={`student text-primary-900 ${styles.container}`}>
        <div className={styles.topSection}>
          <h1>Dashboard </h1>
        </div><StudentNavbar home={{className: "bg-secondary-50"}}/>
        <div >
          <div className={styles.courseCards}>
            {courses.map((course) => (
              <div key={course.courseID} className={styles.courseCard}>
                <StudentCourseCard
                courseID={course.courseID}
                courseName={course.courseName}
                color="#b3d0c3"
                img="/logo-transparent-png.png"
                instructorName={`${course.instructorFirstName} ${course.instructorLastName}`}
              />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}