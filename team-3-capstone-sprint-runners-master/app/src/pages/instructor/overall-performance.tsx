import React, { useState, useEffect } from "react";
import { useSessionValidation } from '../api/auth/checkSession';
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import styles from "../../styles/instructor-assignments-creation.module.css";
import { Button, Card, CardHeader, CardBody, CardFooter, Breadcrumbs, BreadcrumbItem, Spinner, Listbox, ListboxItem } from "@nextui-org/react";
import AdminNavbar from "../components/admin-components/admin-navbar";
import router from "next/router";

export default function Component() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useSessionValidation('instructor', setLoading, setSession);

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return <p>No user found in session</p>;
  }

  const isAdmin = session?.user?.role === 'admin';
  function handleHomeClick(): void {
    router.push("/instructor/dashboard");
  }

  if(loading){
    return <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
    <Spinner color='primary' size="lg" />
</div>;
  }

  return (
    <>
      {isAdmin ? <AdminNavbar grades={{ className: "bg-primary-500" }} /> : <InstructorNavbar grades={{ className: "bg-primary-500" }} />}
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Grades</h1>
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem>Grades</BreadcrumbItem>
          </Breadcrumbs>

        </div>
        <div className={styles.mainContent}>
          <div className={styles.rectangle}>
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="bg-background shadow-lg rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">MATH201 - Calculus I</h2>
                    <div className="bg-primary-foreground text-primary px-3 py-1 rounded-full text-sm font-medium">92%</div>
                  </CardHeader>
                  <CardBody className="p-4">
                    <p className="text-muted-foreground">Overall average score for students in this course.</p>
                  </CardBody>
                  <CardFooter className="bg-muted p-4 flex justify-end">
                    <Button onClick={() => { }}>View Details</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
          <div className={styles.notificationsSection}>
            
            <h3 className="my-3">Search Individual Student</h3>
            <div className={styles.notificationsContainer}>
              {/* TODO: add search functionality for selecting to view grades for a specific student */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}