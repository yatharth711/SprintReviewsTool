/* 
  As mentioned in the previous file, this page is not active in the final version of the application. The page was intended to be part of the admin functionality on the admin portal.
  This page was a planned feature that was not implemented due to time constraints. The page was intended to allow admins to view all users on the platform, including instructors and students.
  With the view ability, admins would be able to view/manage users. The serach functionality was never added to the page. Backend calls would be required to implement this feature.
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
import RoleRequestCard from "../components/admin-components/admin-role-card";
import ViewUserCard from "../components/admin-components/admin-user-card";


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
  const handleRoleRequestClick = () => {
    router.push('/admin/role-requests');
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
      case "role":
        handleRoleRequestClick();
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
          <h1>View Users</h1>
          <br />
          {/* <Button size='sm' color="secondary" variant='ghost' className=' self-end' onClick={handleCreateCourseClick}>Create Course</Button> */}
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Admin Portal</BreadcrumbItem>
            <BreadcrumbItem>View Users</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.assignmentsSection}>
            <ViewUserCard />
            <ViewUserCard/>
          </div>

          <div className={styles.notificationsSection}>
            <div className={styles.actionButtons}>
            <Listbox aria-label="Actions" onAction={handleAction} color='primary' variant='flat'>
            <ListboxItem key="admin" className='text-primary-900 border-1 border-primary bg-primary-50'>Admin Portal</ListboxItem>
                <ListboxItem key="archives">Archived Courses</ListboxItem>
                <ListboxItem key="role">Role Requests</ListboxItem>
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
