/* 
  As mentioned in the previous file, this page is not active in the final version of the application. The page was intended to be part of the admin functionality on the admin portal.
  The page was intended to allow admins to review and accept or reject role requests from instructors. The page was not implemented in the final version of the application due to time constraints.
  The portal-home is the main admin page and this is not being called by it currently. The page remains as it can be added in future versions of the application.
*/

import AdminNavbar from "../components/admin-components/admin-navbar";
import AdminHeader from "../components/admin-components/admin-header";
import { useState } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';
import styles from '../../styles/admin-portal-home.module.css';
import { Divider, Listbox, ListboxItem, Input, Breadcrumbs, BreadcrumbItem, Spinner } from "@nextui-org/react";
import AdminCourseCard from "../components/admin-components/admin-course";
import router from "next/router";
import JoinRequestCard from "../components/admin-components/admin-role-card";


export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Use the session validation hook to check if the user is logged in
  useSessionValidation('admin', setLoading, setSession);

  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
    <Spinner color='primary' size="lg" />
</div>;
  }

 

  const handleCourseClick = (courseID: number) => {
    router.push({
      pathname: '/instructor/course-dashboard',
      query: { courseID },
    });
  };
  const handleViewUsersClick = () => {
    router.push('/admin/view-users');
  };
  const handleJoinRequestClick = () => {
    router.push('/admin/join-requests');
  };
  const handleArchivedCoursesClick = () => {
    router.push('/admin/archived-courses');
  };
  const handleHomeClick = () => {
    router.push('/admin/portal-home');
  };
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
      // case "delete":
      //   // Implement delete course functionality
      //   console.log("Delete course");
      //   break;
      default:
        console.log("Unknown action:", key);
    }
  };
  return (
    <>
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Role Requests</h1>
          <br />
          {/* <Button size='sm' color="secondary" variant='ghost' className=' self-end' onClick={handleCreateCourseClick}>Create Course</Button> */}
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Admin Portal</BreadcrumbItem>
            <BreadcrumbItem>Role Requests</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.assignmentsSection}>
            <JoinRequestCard />
            <JoinRequestCard/>
          </div>

          <div className={styles.notificationsSection}>
            <div className={styles.actionButtons}>
            <Listbox aria-label="Actions" onAction={handleAction} color='primary' variant='flat'>
              <ListboxItem key="admin" className='text-primary-900 border-1 border-primary bg-primary-50'>Admin Portal</ListboxItem>
              <ListboxItem key="archives">Archived Courses</ListboxItem>
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
          <AdminNavbar admin={{ className: "bg-primary-500" }}/>
        </div>
      </div>
    </>
  );
}
