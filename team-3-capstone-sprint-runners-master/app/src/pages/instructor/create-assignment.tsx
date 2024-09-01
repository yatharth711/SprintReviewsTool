import type { NextPage } from "next";
import styles from "../../styles/instructor-assignments-creation.module.css";
import { useRouter } from "next/router";

import { Card, SelectItem, Select, Listbox, ListboxItem, AutocompleteItem, Autocomplete, 
  Textarea, Button, Breadcrumbs, BreadcrumbItem, Divider, Checkbox, CheckboxGroup, 
  Progress, Input, Spinner 
} from "@nextui-org/react";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import AdminNavbar from "../components/admin-components/admin-navbar";
import React, { ChangeEvent, useCallback, useState, useEffect } from "react";
import { useSessionValidation } from '../api/auth/checkSession';
import toast from "react-hot-toast";
import { getNotificationsForStudent } from '../utils/getNotificationsForStudent';

interface CourseData {
  courseID: string;
  courseName: string;
}

const Assignments: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const { courseId } = router.query;

  useSessionValidation("instructor", setLoading, setSession);

  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [groupAssignment, setGroupAssignment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allowedFileTypes, setAllowedFileTypes] = useState<string[]>([]);
  const [courseName, setCourseName] = useState<string>("");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [allowLinks, setAllowLinks] = useState(false);
  const [linkTypes, setLinkTypes] = useState<string[]>([]);

  useEffect(() => {
    const { source, courseId } = router.query;
    if (source === 'course' && courseId) {
      fetchCourseName(courseId as string);
    }
  }, [router.query]);

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

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setAllowedFileTypes((prev) =>
      checked ? [...prev, fileType] : prev.filter((type) => type !== fileType)
    );
  };

  const handleLinkTypeChange = (linkType: string, checked: boolean) => {
    setLinkTypes((prev) =>
      checked ? [...prev, linkType] : prev.filter((type) => type !== linkType)
    );
  };

  const onCreateAssignmentButtonClick = useCallback(async () => {
    setError(null);

    if (!title.trim()) {
      setError("Please enter the assignment title.");
      return;
    }
    if (!startDate.trim()) {
      setError("Please select a start date.");
      return;
    }
    if (!endDate.trim()) {
      setError("Please select an end date.");
      return;
    }
    if (!dueDate.trim()) {
      setError("Please select a due date.");
      return;
    }
    if (allowedFileTypes.length === 0) {
      setError("Please select at least one allowed file type.");
      return;
    }
    if (!courseId) {
      setError("Course ID is missing.");
      return;
    }
    const selectedDueDate = new Date(dueDate);
    const selectedEndDate = new Date(endDate);
    const selectedStartDate = new Date(startDate)
    const now = new Date();
    if (selectedDueDate <= now || selectedEndDate <= now || selectedStartDate >= selectedDueDate || selectedStartDate >= selectedEndDate || selectedEndDate < selectedDueDate) {
      setError("Due date or end date cannot be in the past. Please select a future date and time.");
      return;
    }
    const isoDate = new Date(dueDate).toISOString();
    const isoStart = new Date(startDate).toISOString(); //converts start date into ISO string
    const isoEnd = new Date(endDate).toISOString(); //converts end date into ISO string

    let finalAllowedTypes = [...allowedFileTypes];
    if (allowLinks) {
      if (linkTypes.length === 0) {
        finalAllowedTypes.push('link');
      } else {
        finalAllowedTypes = [...finalAllowedTypes, ...linkTypes];
      }
    }
    const response = await fetch("/api/addNew/createAssignment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        startDate: isoStart,
        endDate: isoEnd,
        dueDate: isoDate,
        courseID: Number(courseId),
        file: fileContent,
        groupAssignment,
        allowedFileTypes: finalAllowedTypes,
        instructorID: session.user.userID,
      }),
    });

    if (response.ok) {
      const assignmentData = await response.json();
      toast.success("Assignment created successfully!");

      const courseResponse = await fetch(`/api/courses/${courseId}`);
      const courseData = await courseResponse.json();

      const studentsResponse = await fetch(`/api/courses/getCourseList?courseID=${courseId}`);
      if (studentsResponse.ok) {
        const students = await studentsResponse.json();
        for (let student of students) {
          try {
            const notifications = await getNotificationsForStudent(student.userID);
            if (notifications.assignmentNotification) {
              const emailResponse = await fetch('/api/emails/assignmentEmail', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  firstName: student.firstName,
                  email: student.email,
                  title: assignmentData.title,
                  courseName: courseData.courseName,
                }),
              });
              if (!emailResponse.ok) {
                console.error(`Failed to send email to ${student.email}`);
              } 
            }
          } catch (error) {
            console.error(`Error processing notifications for student ${student.userID}:`, error);
          }
        }
      }

      router.push(`/instructor/course-dashboard?courseId=${courseId}`);
      
    } else {
      const errorData = await response.json();
      setError(errorData.message || "An error occurred while creating the assignment");
      toast.error(errorData.message);
    }
  }, [title, description, startDate, endDate, dueDate, courseId, fileContent, groupAssignment, allowedFileTypes, allowLinks, linkTypes, router, session]);

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

  function handleHomeClick(): void {
    router.push("/instructor/dashboard");
  }

  function handleCourseDashboardClick(): void {
    router.push(`/instructor/course-dashboard?courseId=${courseId}`);
  }

  const handleCreateAssignmentClick = () => {
    router.push('/instructor/create-assignment');
  };
  const handleCreatePeerReviewAssignmentClick = () => {
    router.push('/instructor/release-assignment');
  };
  const handleCreateGroupPeerReviewAssignmentClick = () => {
    router.push('/instructor/create-groups');
  };
  const handleAction = (key: any) => {
    switch (key) {
      case "create":
        handleCreateAssignmentClick();
        break;
      case "peer-review":
        handleCreatePeerReviewAssignmentClick();
        break;
      case "group-review":
        handleCreateGroupPeerReviewAssignmentClick();
        break;
      case "delete":
        console.log("Delete course");
        break;
      default:
        console.log("Unknown action:", key);
    }
  };

  const handleBackClick = () => {
    const { source } = router.query;
    if (source === 'course') {
      router.push(`/instructor/course-dashboard?courseId=${router.query.courseId}`);
    } else {
      router.push('/instructor/assignments');
    }
  };

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Create Assignment for {router.query.source === 'course' ? courseName : 'Course'}</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleBackClick}>{router.query.source === 'course' ? (courseName || 'Course Dashboard') : 'Assignments'}</BreadcrumbItem>
            <BreadcrumbItem>Create Assignment</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className="instructor flex-col bg-white p-[1.5%] w-[86%] m-[.8%] ml-auto h-fit">
            <h2>Create Assignment For Student Submission</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <Input
              color="primary"
              variant="underlined"
              size="sm"
              type="text"
              label="Title"
              className={styles.textbox}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              size="sm"
              color="primary"
              variant="underlined"
              placeholder="Assignment Description"
              className={styles.textbox}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-evenly m-1">
              <div className="text-left w-1/3 p-2 pt-0">
                <h3>Select Start Date:</h3>
                <Input
                  color="success"
                  variant="underlined"
                  size="sm"
                  type="datetime-local"
                  className={styles.textbox}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="text-left w-1/3 p-2 pt-0">
                <h3>Select Due Date:</h3>
                <Input
                  color="warning"
                  variant="underlined"
                  size="sm"
                  type="datetime-local"
                  className={styles.textbox}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
              <div className="text-left w-1/3 p-2 pt-0">
                <h3>Select End Date:</h3>
                <Input
                  color="danger"
                  variant="underlined"
                  size="sm"
                  type="datetime-local"
                  className={styles.textbox}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </div>
            <br />
            <div className="flex">
              
              <Checkbox
                className={styles.innerTitle}
                isSelected={groupAssignment}
                onValueChange={setGroupAssignment}
              >
                Group Assignment
              </Checkbox>
            </div>
            <br /><h3 className={styles.innerTitle}>Allowed file types:</h3><br />
            <div className="flex-row align-top items-start justify-start">
              <CheckboxGroup
                size="sm"
                color="primary"
                value={allowedFileTypes}
                onValueChange={setAllowedFileTypes}
                orientation="horizontal"
              >
                
                <Checkbox value="txt">Text (.txt)</Checkbox>
                <Checkbox value="pdf">PDF (.pdf)</Checkbox>
                <Checkbox value="docx">Word (.docx)</Checkbox>
                <Checkbox value="zip">ZIP (.zip)</Checkbox>
                <Checkbox
                  isSelected={allowLinks}
                  onValueChange={setAllowLinks}
                >
                  Allow link submissions
                </Checkbox>

              </CheckboxGroup>
              <div className="flex-col">
                
                {allowLinks && (
                  <div>
                    <br />
                    <CheckboxGroup
                      size="sm"
                      color="primary"
                      value={linkTypes}
                      onValueChange={setLinkTypes}
                      orientation="vertical"
                    >
                      <h3 className={styles.innerTitle}>Allowed link types:</h3>
                      <Checkbox value="github">GitHub</Checkbox>
                      <Checkbox value="googledocs">Google Docs</Checkbox>
                      <Checkbox value="link">Any link</Checkbox>
                    </CheckboxGroup>
                  </div>
                )}
              </div>
            </div>
            <br />
            <Button color="success" variant="solid" className="cursor-pointer m-2 mx-auto p-4 text-white w-[100%]" onClick={onCreateAssignmentButtonClick}>Create Assignment</Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assignments;
