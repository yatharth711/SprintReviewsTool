import StudentHeader from "../components/student-components/student-header";
import StudentNavbar from "../components/student-components/student-navbar";
import { useState } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';
import styles from "../../styles/instructor-assignments-creation.module.css";
import { Breadcrumbs, BreadcrumbItem, Card, CardHeader, CardBody, CardFooter, Button, Spinner } from "@nextui-org/react";
import router from "next/router";


export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Use the session validation hook to check if the user is logged in
  useSessionValidation('student', setLoading, setSession);

  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] student flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>;
  }
  
  function handleHomeClick(): void {
    router.push("/instructor/dashboard");
  }
  return (
    <>
      <div className={`student text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Grades</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem>Grades</BreadcrumbItem>
          </Breadcrumbs>

        </div>
        <div className={styles.mainContent}>
          <div className={`flex-col bg-white p-[1%] w-[86%] m-[.8%] ml-auto h-[100%]`}>
            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <Card className="bg-background shadow-lg rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold">MATH201 - Calculus I</h2>
                    <div className="bg-primary-foreground text-primary px-3 py-1 rounded-full text-sm font-medium">92%</div>
                  </CardHeader>
                  <CardBody className="p-4 bg-secondary-50">
                    <p className="text-muted-foreground">Overall average score for students in this course.</p>
                  </CardBody>
                  <CardFooter className="bg-secondary-50 p-4 flex justify-end">
                    <Button onClick={() => { }}>View Details</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <StudentNavbar grades={{className: "bg-secondary-50"}}/>
    </>
  );
}