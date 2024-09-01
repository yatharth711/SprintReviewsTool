// instructor/course-dashboard.tsx
import { useRouter } from "next/router";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import AdminNavbar from "../components/admin-components/admin-navbar";
import { useEffect, useState, useCallback } from "react";
import { useSessionValidation } from "../api/auth/checkSession";
import styles from "../../styles/instructor-course-dashboard.module.css";
import InstructorAssignmentCard from "../components/instructor-components/instructor-course-assignment-card";
import {  Button,  Breadcrumbs,  BreadcrumbItem,  Listbox,  ListboxItem,  Divider,  Checkbox,  CheckboxGroup,  Spinner,  Modal,  ModalContent,  ModalHeader,  ModalBody, ModalFooter,  Input} from "@nextui-org/react";
import InstructorReviewCard from "../components/instructor-components/instructor-PR-card";

interface CourseData {
  courseID: string;
  courseName: string;
}

interface Assignment {
  assignmentID: number;
  linkedAssignmentID: string;
  title: string;
  description: string;
  deadline: string;
  groupAssignment: boolean;
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [peerReviewAssignments, setPeerReviewAssignments] = useState<Assignment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedAssignmentTypes, setSelectedAssignmentTypes] = useState<string[]>(['all']);

  const router = useRouter();
  const { courseId } = router.query;

  useSessionValidation("instructor", setLoading, setSession);

  useEffect(() => {
    if (courseId) {
      fetchAssignments(courseId);
      fetchPeerReviewAssignments(courseId);
      fetch(`/api/courses/${courseId}`)
        .then((response) => response.json())
        .then((data: CourseData) => {
          console.log("Fetched course data:", data);
          setCourseData(data);
        })
        .catch((error) => console.error("Error fetching course data:", error));
    }
  }, [courseId]);

  const handleCheckboxChange = (type: string, isChecked: boolean) => {
    if (type === 'all') {
      setSelectedAssignmentTypes(['all']);
    } else {
      setSelectedAssignmentTypes(prevTypes => {
        if (isChecked) {
          return [...prevTypes.filter(t => t !== 'all'), type];
        } else {
          const newTypes = prevTypes.filter(t => t !== type);
          return newTypes.length > 0 ? newTypes : ['all'];
        }
      });
    }
  };

  const handleHomeClick = async () => {
    router.push("/instructor/dashboard");
  };

  const fetchAssignments = async (courseID: string | string[]) => {
    try {
      const response = await fetch(
        `/api/assignments/getAssignments4CoursesInstructor?courseID=${courseID}`
      );
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.courses);
      } else {
        console.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchPeerReviewAssignments = async (courseID: string | string[]) => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/reviews/getReviewsByCourseIdForInstructor?courseID=${courseID}&t=${timestamp}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched peer review assignments:", data);
        setPeerReviewAssignments(data.reviews || []);
      } else {
        console.error("Failed to fetch peer review assignments");
      }
    } catch (error) {
      console.error("Error fetching peer review assignments:", error);
    }
  };

  const archiveCourse = useCallback(async () => {
    try {
      const response = await fetch('/api/courses/archiveCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseID: courseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle archive status');
      }

      router.push("/instructor/dashboard");
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  }, [courseId, router]);

  if (!courseData || loading) {
    return (
      <div className='w-[100vw] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>
    );
  }

  const handleCreateAssignmentClick = () => {
    router.push({
      pathname: '/instructor/create-assignment',
      query: { source: 'course', courseId: courseId } //sends courseID to create assignment page if clicked from course dashboard
    });
  };

  const handleCreatePeerReviewAssignmentClick = () => {
    router.push({
      pathname: '/instructor/release-assignment',
      query: { source: 'course', courseId: courseId } //sends courseID to release assignment page if clicked from course dashboard
    });
  };

  const handleCreateGroupPeerReviewAssignmentClick = () => {
    router.push({
      pathname: '/instructor/create-groups',
      query: { source: 'course', courseId: courseId } //sends courseID to create group page if clicked from course dashboard
    });
  };

  const handleEditCourseNameClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCourseNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCourseName(event.target.value);
  };

  const handleCourseNameUpdate = async () => {
    try {
      const response = await fetch(`/api/updateTable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: 'course',
          data: {
            courseID: courseId,
            courseName: newCourseName
          }
        })
      });
      if (response.ok) {
        const updatedCourseData = await response.json();
        setCourseData(updatedCourseData);
        setIsModalOpen(false);
        router.reload();
      } else {
        console.error("Failed to update course name");
      }
    } catch (error) {
      console.error("Error updating course name:", error);
    }
  };
    
  const handeEnrollRemoveStudentsClick = () => {
    router.push(`/instructor/manage-students?courseId=${courseData.courseID}`);
  }

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
      case "edit-course":
        handleEditCourseNameClick();
        break;
      case "manage-students":
        handeEnrollRemoveStudentsClick();
        break;
      case "archive":
        setIsArchiveModalOpen(true);
        break;
      default:
        console.log("Unknown action:", key);
    }
  };

  if (!session || !session.user || !session.user.userID) {
    console.error("No user found in session");
    return null;
  }

  const isAdmin = session.user.role === "admin";

  const individualAssignments = assignments.filter(assignment => !assignment.groupAssignment && !assignment.title.toLowerCase().includes('peer review'));
  const groupAssignments = assignments.filter(assignment => assignment.groupAssignment);
  const peerReviewCards = assignments.filter(assignment => assignment.title.toLowerCase().includes('peer review'));

  const shouldRenderAssignments = (type: string) => {
    return selectedAssignmentTypes.includes('all') || selectedAssignmentTypes.includes(type);
  };

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>{courseData.courseName}</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem>{courseData.courseName}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={styles.assignmentsSection}>
            <CheckboxGroup
              label="Filter Assignments:"
              orientation="horizontal"
              color="primary"
              size="sm"
              className="text-left flex-row mb-2 text-primary-900 items-center"
              value={selectedAssignmentTypes}
            >
              <Checkbox 
                value="all" 
                onChange={(e) => handleCheckboxChange('all', e.target.checked)}
                isSelected={selectedAssignmentTypes.includes('all')}
              >
                All Assignments
              </Checkbox>
              <Checkbox 
                value="individual" 
                onChange={(e) => handleCheckboxChange('individual', e.target.checked)}
                isSelected={selectedAssignmentTypes.includes('individual')}
              >
                Individual Assignments
              </Checkbox>
              <Checkbox 
                value="group" 
                onChange={(e) => handleCheckboxChange('group', e.target.checked)}
                isSelected={selectedAssignmentTypes.includes('group')}
              >
                Group Assignments
              </Checkbox>
              <Checkbox 
                value="peerReviews" 
                onChange={(e) => handleCheckboxChange('peerReviews', e.target.checked)}
                isSelected={selectedAssignmentTypes.includes('peerReviews')}
              >
                Peer Reviews
              </Checkbox>
            </CheckboxGroup>

            {shouldRenderAssignments('individual') && (
              <>
                <h3 className={styles.innerTitle}>Individual Assignments</h3>
                <br />
                <Divider className="instructor bg-secondary" />
                <br />
                <div className={styles.courseCard}>
                  {individualAssignments.length > 0 ? (
                    individualAssignments.map((assignment) => (
                      <div key={assignment.assignmentID} className={styles.courseCard}>
                        <InstructorAssignmentCard
                          courseID={assignment.assignmentID}
                          assignmentName={assignment.title}
                          color="#9fc3cf"
                          deadline={new Date(assignment.deadline).toLocaleString()}
                          groupAssignment={assignment.groupAssignment}
                        />
                      </div>
                    ))
                  ) : (
                    <p>No individual assignments found for this course.</p>
                  )}
                </div>
              </>
            )}

            {shouldRenderAssignments('group') && (
              <>
                <h3 className={styles.innerTitle}>Group Assignments</h3>
                <br />
                <Divider className="instructor bg-secondary" />
                <br />
                <div className={styles.courseCard}>
                  {groupAssignments.length > 0 ? (
                    groupAssignments.map((assignment) => (
                      <div key={assignment.assignmentID} className={styles.courseCard}>
                        <InstructorAssignmentCard
                          courseID={assignment.assignmentID}
                          assignmentName={assignment.title}
                          color="#9fc3cf"
                          deadline={new Date(assignment.deadline).toLocaleString()}
                          groupAssignment={assignment.groupAssignment}
                        />
                      </div>
                    ))
                  ) : (
                    <p>No group assignments found for this course.</p>
                  )}
                </div>
              </>
            )}

            {shouldRenderAssignments('peerReviews') && (
              <>
                <h3 className={styles.innerTitle}>Peer Reviews</h3>
                <br />
                <Divider className="instructor bg-secondary" />
                <br />
                <div className={styles.courseCard}>
                  {peerReviewAssignments.length > 0 ? (
                    peerReviewAssignments.map((assignment) => (
                      <div key={assignment.assignmentID} className={`w-100% ${styles.courseCard}`}>
                        <InstructorReviewCard
                          reviewID={assignment.assignmentID}
                          linkedAssignmentID={assignment.linkedAssignmentID}
                          deadline={new Date(assignment.deadline).toLocaleString()}
                          color="#9fc3cf"
                          title={assignment.title}
                        />
                      </div>
                    ))
                  ) : (
                    <p>No peer reviews found for this course.</p>
                  )}
                </div>
              </>
            )}

          </div>
          <div className={styles.notificationsSection}>
            <div className={styles.actionButtons}>
              <Listbox aria-label="Actions" onAction={handleAction}>
                <ListboxItem key="create" color="primary">Create Assignment</ListboxItem>
                <ListboxItem key="peer-review" color="primary">Create Peer Review</ListboxItem>
                <ListboxItem key="group-review" color="primary"> Create Student Groups</ListboxItem>
                <ListboxItem key="manage-students" color="primary">Manage Students</ListboxItem>
                <ListboxItem key="edit-course" color="primary">Edit Course Name</ListboxItem>
                {isAdmin && (
                  <ListboxItem key="archive" className="text-danger" color="danger">
                    Archive Course
                  </ListboxItem>
                )}
              </Listbox>
            </div>
          </div>
        </div>

        {/* Archive Course Confirmation Modal */}
        <Modal 
          className='instructor z-20' 
          backdrop="blur" 
          isOpen={isArchiveModalOpen} 
          onOpenChange={(open) => setIsArchiveModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Archive Course</ModalHeader>
            <ModalBody>
              <p>Are you sure you want to archive this course? This action can be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsArchiveModalOpen(false)}>
                Close
              </Button>
              <Button color="danger" onClick={archiveCourse}>
                Archive
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>

      <Modal
        className='instructor z-20'
        backdrop="blur"
        isOpen={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      >
        <ModalContent>
          <ModalHeader>Edit Course Name</ModalHeader>
          <ModalBody>
            <Input 
              isClearable 
              fullWidth 
              label="Enter New Course Name"
              value={newCourseName} 
              onChange={handleCourseNameChange} 
            />
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button color="primary" onPress={handleCourseNameUpdate}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
