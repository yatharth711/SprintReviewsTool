import { useRouter } from "next/router";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import AdminNavbar from "../components/admin-components/admin-navbar";
import { useEffect, useState } from "react";
import { useSessionValidation } from '../api/auth/checkSession';
import AssignmentDetailCard from '../components/instructor-components/instructor-assignment-details';
import styles from "../../styles/AssignmentDetailCard.module.css";
import { Breadcrumbs, BreadcrumbItem, Spinner } from "@nextui-org/react";
import type { NextPage } from "next";
import toast from 'react-hot-toast';

interface Assignment {
  assignmentID: number;
  title: string;
  descr: string;
  deadline: string;
  courseID: number;
  groupAssignment: boolean;
}

interface CourseData {
  courseID: number;
  courseName: string;
}

interface SubmittedEntity {
  studentID: number;
  name: string;
  fileName: string;
}

interface RemainingEntity {
  studentID: number;
  name: string;
}

const AssignmentDashboard: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [submittedEntities, setSubmittedEntities] = useState<SubmittedEntity[] | { groupID: number; groupName: string; members: SubmittedEntity[] }[]>([]);
  const [remainingEntities, setRemainingEntities] = useState<RemainingEntity[] | { groupID: number; groupName: string; members: RemainingEntity[] }[]>([]);
  useSessionValidation('instructor', setLoading, setSession);

  useEffect(() => {
    if (!router.isReady) return;

    const { assignmentID } = router.query;

    const fetchData = async () => {
      if (assignmentID) {
        try {
          const assignmentResponse = await fetch(`/api/assignments/${assignmentID}`);
          if (assignmentResponse.ok) {
            const assignmentData: Assignment = await assignmentResponse.json();
            setAssignment(assignmentData);

            if (assignmentData.courseID) {
              const courseResponse = await fetch(`/api/courses/${assignmentData.courseID}`);
              if (courseResponse.ok) {
                const courseData: CourseData = await courseResponse.json();
                setCourseData(courseData);
              }
            }

            const studentsResponse = await fetch(`/api/submissions/${assignmentID}/group-students`);
              
            if (studentsResponse.ok) {
              const { submittedGroups, remainingGroups, submittedStudents, remainingStudents } = await studentsResponse.json();
              setSubmittedEntities(submittedGroups || submittedStudents);
              setRemainingEntities(remainingGroups || remainingStudents);
            }
          } else {
            const errorData = await assignmentResponse.json();
            setError(errorData.message || 'Error fetching assignment data');
            toast.error(errorData.message);
          }
        } catch (error) {
          setError('An error occurred. Please try again.');
          toast.error("An error occurred. Please try again.")
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, router.query]);

  if (loading || !assignment) {
    return (
      <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>
    );
  }

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }

  const isAdmin = session.user.role === 'admin';

  const handleBackClick = () => router.push(`/instructor/course-dashboard?courseId=${courseData?.courseID}`);
  const handleHomeClick = () => router.push("/instructor/dashboard");

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{assignment.title || "Assignment Name- Details"}</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleBackClick}>
              {courseData ? courseData.courseName : "Course Dashboard"}
            </BreadcrumbItem>
            <BreadcrumbItem>{assignment.title}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.assignmentsSection}>
          <AssignmentDetailCard
            assignmentID={assignment.assignmentID}
            title={assignment.title}
            description={assignment.descr || "No description available"}
            deadline={new Date(assignment.deadline).toLocaleString() || "No deadline set"}
            isGroupAssignment={true}
            submittedEntities={submittedEntities}
            remainingEntities={remainingEntities}
          />
        </div>
      </div>
    </>
  );
}

export default AssignmentDashboard;
