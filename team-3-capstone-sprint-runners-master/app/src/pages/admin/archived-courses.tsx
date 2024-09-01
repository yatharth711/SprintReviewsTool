//archived-courses.tsx
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import AdminCourseCard from "../components/admin-components/admin-course";
import AdminNavbar from "../components/admin-components/admin-navbar";
import AdminHeader from "../components/admin-components/admin-header";
import { useState, useEffect } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';
import styles from '../../styles/admin-portal-home.module.css';
import { useRouter } from 'next/router';
import { Divider, Listbox, ListboxItem, Input, BreadcrumbItem, Breadcrumbs, Spinner } from '@nextui-org/react';

// Interface for course object to be displayed in course cards
interface Course {
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
    async function fetchCourses() {
      try {
        const response = await fetch('/api/courses/getAllArchivedCourses?isArchived=true'); // Fetch all archived courses
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json(); // Parse response data as JSON object 
        setCourses(data); // Set courses state to data
      } catch (error) {
        if (error instanceof Error) { // Check if error is an instance of Error class
          setError(error.message);
          alert(error.message);
        } else { 
          setError(String(error)); // If error is not an instance of Error class, convert to string
          alert(String(error));
        }
      } finally {
        setLoading(false); // Set loading state to false after fetching courses 
      }
    }
    // Fetch courses only if loading state is false (session has been validated) 
    if (!loading) {
      fetchCourses();
    }
  }, [loading]); // Fetch courses when loading state changes

  // If session is not validated, display loading spinner 
  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
    <Spinner color='primary' size="lg" />
</div>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }
  // Redirect user to course dashboard when course card is clicked 
  const handleCourseClick = (courseID: number) => {
    router.push({
      pathname: '/instructor/course-dashboard',
      query: { courseID }, // Pass courseID as query parameter to course dashboard page to track the course accessed by user (session management)
    });
  };

  /*
    Join Requests button and page redirection is not actively used in the application but is implemented for future use.
    The button is displayed in the UI but is not functional. The button is included in the UI design for demonstration purposes
    this was a planned feature that was not implemented due to time constraints. Join requests are for admin to approve or reject instructor requests to join the platform.
    If the feature is to be implemented, the button should be functional and should redirect the user to the join requests page via an API call, which is not 
    implemented in the current version of the application. I.e. the backend is required to be developed to handle join requests.
  */
  const handleJoinRequestClick = () => { // Redirect user to join requests page when "Join Requests" button is clicked
    router.push('/admin/role-requests');
  };
  /* Similar to Join requests, the ability  for admins to view all users was a planned feature to the application, but cut due to time contraints. 
    Like the Join Requests button, the View Users button is displayed in the UI but is not functional. For future implementation, the backend calls will need to be added.
    This feature would allow admins to view all users on the platform, including instructors and students. Originally this was intended to also allow admin to search for specific users
    and view details about the users. This feature would be useful for admins to manage users on the platform and view user details.
  */
  const handleViewUsersClick = () => { // Redirect user to view users page when "View Users" button is clicked
    router.push('/admin/view-users');
  };

  const handleArchivedCoursesClick = () => { // Redirect user to archived courses page when "Archived Courses" button is clicked
    router.push('/admin/archived-courses');
  };
  const handleHomeClick = () => { // Redirect user to admin portal home page when "Admin Portal" button is clicked
    router.push('/admin/portal-home');
  };
  // Handle action when action button is clicked via switch case 
  const handleAction = (key: any) => {
    switch (key) {
      case "view":
        handleViewUsersClick();
        break;
      case "join":
        handleJoinRequestClick();
        break;
      case "archives":
        handleArchivedCoursesClick();
        break;
      case "admin":
        handleHomeClick();
        break;
      case "delete":
        console.log("You sure bout that? You sure you want to Delete the course?");
        break;
      default: // Display error message if action is unknown
        console.log("Unknown action:", key);
    }
  };
  // Display archived courses page with course cards and notifications 
  return (
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Archived Courses</h1>
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Admin Dashboard</BreadcrumbItem> 
            <BreadcrumbItem>Archived Courses</BreadcrumbItem>
          </Breadcrumbs>        
          <Divider className="my-1" />
        </div>
        <div className={styles.mainContent}>
          <div className={styles.assignmentsSection}>

            <div className={styles.courseCards}>
              {courses.map((course, index) => (
                <div className={styles.courseCard} key={course.courseID}>
                  <AdminCourseCard
                    key={course.courseID}
                    courseName={course.courseName}
                    instructor={`${course.instructorFirstName} ${course.instructorLastName}`}
                    averageGrade={course.averageGrade}
                    courseID={course.courseID}
                    isArchived={true}
                    img="/logo-transparent-png.png"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.notificationsSection}>
            <div className={styles.actionButtons}>
              <Listbox aria-label="Actions" onAction={handleAction} color='primary' variant='flat'>
                <ListboxItem key="admin" className='text-primary-900 border-1 border-primary bg-primary-50'>Admin Portal</ListboxItem>
                <ListboxItem key="join">Join Requests</ListboxItem>
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
          { href: "./join-requests", title: "Join Requests" },
          { href: "./archived-courses", title: "Archived Courses" },
        ]}
      /> */}
          <AdminNavbar admin={{ className: "bg-primary-500" }} />
        </div>
      </div>
  );
}
