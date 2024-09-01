import { useRouter } from "next/router";
import AdminNavbar from "../components/admin-components/admin-navbar";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import styles from '../../styles/instructor-course-dashboard.module.css';
import { Button, Breadcrumbs, BreadcrumbItem, Listbox, ListboxItem, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from "@nextui-org/react";
import { useSessionValidation } from '../api/auth/checkSession';
import React, { useState, useEffect, ChangeEvent } from 'react';
import toast from "react-hot-toast";

interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
}

export default function ManageStudents() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [missingData, setMissingData] = useState<string[]>([]);
  const [newStudentID, setNewStudentID] = useState<number | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isFileEnrollModalOpen, setIsFileEnrollModalOpen] = useState(false);
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const { courseId } = router.query;

  useSessionValidation('instructor', setLoading, setSession);

  useEffect(() => {
    if (session && session.user && session.user.userID && courseId) {
      fetchStudents(courseId as string);
      fetchCourseName(courseId as string);
    }
  }, [session, courseId]);

  // Fetching course name for breadcrumbs
  const fetchCourseName = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourseName(data.courseName);
      }
    } catch (error) {
      console.error('Error fetching course name:', error);
    }
  };

  // Fetching enrolled students for the course
  const fetchStudents = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/getCourseList?courseID=${courseId}`);
      if (response.ok) {
        const studentsData = await response.json();
        setStudents(studentsData || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch students', errorData);
        toast.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    }
  };

  // Function to handle file upload
  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const enrollStudentsResponse = await fetch('/api/listStudents', {
          method: 'POST',
          body: formData,
        });

        if (enrollStudentsResponse.ok) {
          const studentsData = await enrollStudentsResponse.json();
          setStudents(studentsData.students);
          setMissingData(studentsData.missingData);
          console.log('Student Data:', studentsData.students); // Log student data
          console.log('Missing Data:', studentsData.missingData); // Log missing data
          //setShowEnrollPopup(true);
        } else {
          console.error('Failed to upload and process students');
          alert('Failed to upload and process students'); // Ensure alert is shown
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Error uploading file'); // Ensure alert is shown
      }
    }
  }

  const handleEnrollStudent = async () => {
    if (newStudentID === null) {
      toast.error('Please enter a valid student ID');
      return;
    }

    try {
      const response = await fetch(`/api/addNew/enrollStudents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIDs: [newStudentID], courseID: courseId, missingData: [] }),
      });

      if (response.ok) {
        toast.success('Student enrolled successfully');
        setNewStudentID(null);
        setIsEnrollModalOpen(false);
        fetchStudents(courseId as string);
      } else {
        const errorData = await response.json();
        console.error('Failed to enroll student', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error enrolling student:', error);
      toast.error('Error enrolling student');
    }
  };

  const handleEnrollStudentsFromFile = async () => {
    if (students.length === 0) {
      toast.error('No students to enroll, double check that you uploaded the correct file and that the students have created accounts');
      return;
    }

    try {
      const response = await fetch(`/api/addNew/enrollStudents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentIDs: students, courseID: courseId, missingData: missingData }),
      });

      if (response.ok) {
        toast.success('Students enrolled successfully');
        setFileContent(null);
        setIsFileEnrollModalOpen(false);
        fetchStudents(courseId as string);
      } else {
        const errorData = await response.json();
        console.error('Failed to enroll students', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error enrolling students:', error);
      toast.error('Error enrolling students');
    }
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;

    try {
      const response = await fetch(`/api/unenrollStudent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentID: studentToRemove.studentID, courseID: courseId }),
      });

      if (response.ok) {
        toast.success('Student removed successfully');
        setIsConfirmRemoveModalOpen(false);
        setStudentToRemove(null);
        fetchStudents(courseId as string);
      } else {
        const errorData = await response.json();
        console.error('Failed to remove student', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error removing student:', error);
      toast.error('Error removing student');
    }
  };

  if (loading) {
    return <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
      <Spinner color='primary' size="lg" />
    </div>;
  }

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }

  const isAdmin = session.user.role === 'admin';

  const handleHomeClick = async () => {
    router.push("/instructor/dashboard");
  }

  const handleBackClick= async () =>{
    router.push(`/instructor/course-dashboard?courseId=${courseId}`);
  }

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Manage Students</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleBackClick}>{courseName === '' ? 'Course Dashboard': courseName}</BreadcrumbItem> 
            <BreadcrumbItem>Manage Students</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={`flex flex-row items-top justify-top ${styles.assignmentsSection}`}>
            <Card shadow="sm" className="overflow-auto border-solid border-1 border-primary">
              <h2 className="bg-primary-50 p-2">All Students</h2>
              <Listbox>
                {students.length > 0 ? (
                  students.map((student) => (
                    <ListboxItem color="primary" variant="flat" key={student.studentID}>{student.firstName} {student.lastName}</ListboxItem>
                  ))
                ) : (
                  <ListboxItem key=''>No students available</ListboxItem>
                )}
              </Listbox>
            </Card>
          </div>
          <div className={styles.notificationsSection}>
            <Button color="primary" variant="ghost" className="m-1" onClick={() => setIsEnrollModalOpen(true)}>Enroll Individual Student</Button>
            <Button color="primary" variant="ghost" className="m-1" onClick={() => setIsFileEnrollModalOpen(true)}>Enroll Students from CSV</Button>
            <Button color="danger" variant="solid" className="m-1" onClick={() => setIsRemoveModalOpen(true)}>Remove Student</Button>
          </div>
        </div>

        {/* Enroll Individual Student Modal */}
        <Modal
          className='z-20'
          backdrop="blur"
          isOpen={isEnrollModalOpen}
          onOpenChange={(open) => setIsEnrollModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Enroll Individual Student</ModalHeader>
            <ModalBody>
              <Input
                type="number"
                label="Student ID"
                value={newStudentID ? newStudentID.toString() : ''}
                onChange={(e) => setNewStudentID(Number(e.target.value))}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsEnrollModalOpen(false)}>
                Close
              </Button>
              <Button color="primary" onPress={handleEnrollStudent}>
                Enroll
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Enroll Students from CSV Modal */}
        <Modal
          className='z-20'
          backdrop="blur"
          isOpen={isFileEnrollModalOpen}
          onOpenChange={(open) => setIsFileEnrollModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Enroll Students from CSV</ModalHeader>
            <ModalBody>
              <p>Upload Student List: {' '}
                <input type="file" onChange={handleFileUpload} />
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsFileEnrollModalOpen(false)}>
                Close
              </Button>
              <Button color="primary" onPress={handleEnrollStudentsFromFile}>
                Enroll
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Remove Student Modal */}
        <Modal
          className='z-20'
          backdrop="blur"
          isOpen={isRemoveModalOpen}
          onOpenChange={(open) => setIsRemoveModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Remove Student</ModalHeader>
            <ModalBody>
              <Listbox>
                {students.length > 0 ? (
                  students.map((student) => (
                    <ListboxItem key={student.studentID} onClick={() => { setStudentToRemove(student); setIsConfirmRemoveModalOpen(true); }}>{student.firstName} {student.lastName}</ListboxItem>
                  ))
                ) : (
                  <ListboxItem key=''>No students available</ListboxItem>
                )}
              </Listbox>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsRemoveModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Confirm Remove Student Modal */}
        <Modal
          className='z-20'
          backdrop="blur"
          isOpen={isConfirmRemoveModalOpen}
          onOpenChange={(open) => setIsConfirmRemoveModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Confirm Remove Student</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to remove {studentToRemove?.firstName} {studentToRemove?.lastName}?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsConfirmRemoveModalOpen(false)}>
                Cancel
              </Button>
              <Button color="danger" onPress={handleRemoveStudent}>
                Remove
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
