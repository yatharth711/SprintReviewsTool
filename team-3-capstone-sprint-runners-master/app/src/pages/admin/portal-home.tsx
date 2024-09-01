//portal-home.tsx
/* eslint-disable @next/next/no-img-element */
import AdminCourseCard from "../components/admin-components/admin-course";
import AdminNavbar from "../components/admin-components/admin-navbar";
import { useState, useEffect } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';
import styles from '../../styles/admin-portal-home.module.css';
import { useRouter } from 'next/router';
import { Divider, Input, Listbox, ListboxItem, Spinner } from "@nextui-org/react";

interface Course { // Interface for course object to be displayed in course cards
  courseID: number;
  courseName: string;
  instructorFirstName: string;
  instructorLastName: string;
  averageGrade: number | null;
}

export default function Page() {
  const [loading, setLoading] = useState(true); // Loading state for session validation
  const [session, setSession] = useState<any>(null); // Session state for session validation
  const [courses, setCourses] = useState<Course[]>([]); // State to store courses
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Router to redirect user to different pages

  useSessionValidation('admin', setLoading, setSession); // Validate session 

  // Get all courses from database to display in course cards
  useEffect(() => {
    async function fetchCourses() { // Function to fetch courses from database using API call
      try {
        const response = await fetch('/api/courses/getAllArchivedCourses?isArchived=false'); // Fetch all active courses from database (isArchived = false)
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json(); // Parse response data as JSON object
        setCourses(data); // Set courses state to data 
      
        // If error occurs during fetch, catch the error and display an alert with the error message
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
          alert(error.message);
        } else {
          setError(String(error));
          alert(String(error));
        }
      } finally {
        setLoading(false); // Set loading state to false after fetching courses
      }
    }

    if (!loading) {
      fetchCourses(); // Fetch courses only if loading state is false (session has been validated)
    }
  }, [loading]); // Fetch courses when loading state changes

  if (loading) { // If session is not validated, display loading spinner
    return <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
    <Spinner className="Spinner" color='primary' size="lg" />
</div>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const handleViewUsersClick = () => { // Function to redirect user to view users page when "View Users" button is clicked (not implemented)
    router.push('/admin/view-users');
  };
  const handleRoleRequestClick = () => { // Function to redirect user to role requests page when "Role Requests" button is clicked (not implemented)
    router.push('/admin/role-requests');
  };
  const handleArchivedCoursesClick = () => { // Function to redirect user to archived courses page when "Archived Courses" button is clicked
    router.push('/admin/archived-courses');
  };
  const handleAction = (key: any) => { // Function to handle action when an action button is clicked
    switch (key) {
      case "view":
        handleViewUsersClick(); // Redirect user to view users page (not implemented only redirects to page)
        break;
      case "role":
        handleRoleRequestClick(); // Redirect user to role requests page (not implemented only redirects to page)
        break;
      case "archives":
        handleArchivedCoursesClick(); // Redirect user to archived courses page
        break;
      // case "delete":
      //   // Implement delete course functionality
      //   console.log("Delete course");
      //   break;
      default:
        console.log("Unknown action:", key);
    }
  };
  return (
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          {/* <Button size='sm' color="secondary" variant='ghost' className=' self-end' onClick={handleCreateCourseClick}>Create Course</Button> */}
          <h3 className="my-1">All Active Courses</h3>
          <Divider className="my-1" />
        </div>
        <div className={styles.mainContent}>
          <div className={styles.assignmentsSection}>

            <div className={styles.courseCards}>
              {courses.map((course, index) => (
                <div className={styles.courseCard} key={index}>
                  <AdminCourseCard
                    courseName={course.courseName}
                    instructor={`${course.instructorFirstName} ${course.instructorLastName}`}
                    averageGrade={course.averageGrade}
                    courseID={course.courseID}
                    isArchived={false}
                    img="/logo-transparent-png.png"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.notificationsSection}>
            <div className={styles.actionButtons}>
              <Listbox aria-label="Actions" onAction={handleAction}>
                <ListboxItem key="archives">Archived Courses</ListboxItem>
                <ListboxItem key="role">Role Requests</ListboxItem>
                <ListboxItem key="view">View Users</ListboxItem>
              </Listbox>
            </div>
            <hr />
            <h2 className="my-3">Notifications</h2>
            <div className={styles.notificationsContainer}>
              <div className={styles.notificationCard}>Dummy Notification</div>
            </div>
          </div>
          {/* <AdminHeader
        title="Admin Portal"
        addLink={[
          { href: "./view-users", title: "View Users" },
          { href: "./Role-requests", title: "Role Requests" },
          { href: "./archived-courses", title: "Archived Courses" },
        ]}
      /> */}
          <AdminNavbar admin={{ className: "bg-primary-500" }} />
        </div>
      </div>
  );
}
