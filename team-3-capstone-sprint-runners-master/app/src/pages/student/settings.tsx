import StudentNavbar from "../components/student-components/student-navbar";
import { useState, useEffect } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';
import styles from '../../styles/instructor-course-dashboard.module.css';
import { Breadcrumbs, BreadcrumbItem, Switch, Spinner, Button } from "@nextui-org/react";
import router from "next/router";
import axios from 'axios';
import toast from "react-hot-toast";

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    assignmentNotification: true,
    reviewNotification: true,
  });

  // Use the session validation hook to check if the user is logged in
  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    if (session) {
      // Fetch notification preferences from the database
      axios.get(`/api/emails/studentNotification?userID=${session.user?.userID}`)
        .then(response => {
          setNotifications(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching notification preferences:', error);
          setLoading(false);
        });
    }
  }, [session]);

  const handleSave = async () => {
    try {
      await fetch(`/api/updateTable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: 'studentNotifications',
          data: {
            studentID: session.user?.userID,
            assignmentNotification: notifications.assignmentNotification,
            reviewNotification: notifications.reviewNotification,
          }
        })
      });
      console.log('Notification preferences updated successfully');
      toast.success("Notification updated sucessfully")
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setNotifications(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] student flex justify-center text-center items-center my-auto'>
      <Spinner color='primary' size="lg" />
    </div>;
  }

  function handleHomeClick(): void {
    router.push("/student/dashboard");
  }

  return (
    <>
      <div className={`student text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Settings</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem>Settings</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={`flex-col bg-white p-[1%] w-[86%] m-[.8%] ml-auto h-[100%]`}>
            <h3>Customization Settings Below</h3>
            <br />
            <p>This will be a place where user can customize any changes that they may want to make.</p>
            <Switch defaultSelected={notifications.assignmentNotification} className="m-1" onChange={(e) => handleSwitchChange('assignmentNotification', e.target.checked)}>
              Assignment Notifications
            </Switch>
            <Switch defaultSelected={notifications.reviewNotification} className="m-1" onChange={(e) => handleSwitchChange('reviewNotification', e.target.checked)}>
              Peer Review Notifications
            </Switch>
           <Button onClick={handleSave} className="m-1">Save</Button> 
          </div>
          
        </div>
      </div>
      <StudentNavbar settings={{ className: "bg-secondary-200" }} />
    </>
  );
}
