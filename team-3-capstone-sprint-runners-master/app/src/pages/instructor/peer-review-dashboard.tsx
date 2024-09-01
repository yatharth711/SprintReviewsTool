import { useRouter } from "next/router";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import ReviewDetailCard from '../components/instructor-components/instructor-review-details';
import AdminNavbar from "../components/admin-components/admin-navbar";
import { useEffect, useState } from "react";
import { useSessionValidation } from '../api/auth/checkSession';
import styles from "../../styles/AssignmentDetailCard.module.css";

import { Breadcrumbs, Input, ModalFooter, BreadcrumbItem, ModalContent, Spinner, Card, CardBody, Button, Checkbox, Modal, ModalBody, ModalHeader } from "@nextui-org/react";
import toast from "react-hot-toast";


interface Review {
  reviewID: number;
  assignmentID: number;
  assignmentName: string;
  isGroupAssignment: boolean;
  allowedFileTypes: string;
  startDate: string;
  endDate: string;
  deadline: string;
  reviewCriteria: { criteriaID: number; criterion: string; maxMarks: number }[];
}

interface CourseData {
  courseID: string;
  courseName: string;
}

interface ReviewDashboardProps {
  courseId: string;
}

interface StudentDetails {
  studentID: number;
  firstName: string;
  lastName: string;
}

interface ReviewGroup {
  reviewee?: StudentDetails;
  reviewers: StudentDetails[];
  groupData: any; // You may want to define a more specific type based on the actual data structure
}
interface Assignment {
  assignmentID: number;
  title: string;
  descr: string;
  deadline: string;
  courseID: number;

}
export default function ReviewDashboard({ courseId }: ReviewDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const { reviewID } = router.query;

  const [review, setReview] = useState<Review | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [reviewGroups, setReviewGroups] = useState<ReviewGroup[]>([]);
  const [randomizedReviewGroups, setRandomizedReviewGroups] = useState<ReviewGroup[]>([]);
  const [courseName, setCourseName] = useState<string>("");
  const [autoRelease, setAutoRelease] = useState<boolean>(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newAnonymous, setNewAnonymous] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState(false);
  const [reviewsPerAssignment, setReviewsPerAssignment] = useState(4);

  // New state variables for editing groups
  const [isEditGroupsModalOpen, setIsEditGroupsModalOpen] = useState(false);
  const [editableGroups, setEditableGroups] = useState<ReviewGroup[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<{ student: StudentDetails, groupID: number, reviewerIndex: number }[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  useSessionValidation('instructor', setLoading, setSession);

  useEffect(() => {
    if (session && session.user && session.user.userID) {
      fetchCourses(session.user.userID);
    }

  }, [session]);

  const fetchCourses = async (instructorID: number) => {
    try {
      const response = await fetch(`/api/getCourse4Instructor?instructorID=${instructorID}`);
      if (response.ok) {
        const data = await response.json();
        setCourseData(data.courses);
      } else {
        console.error('Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    const { source, courseId } = router.query;

    if (source === 'course' && courseId) {
      // Fetch course name
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

  useEffect(() => {
    if (reviewID) {
      // Fetch review data
      fetch(`/api/reviews/${reviewID}`)
        .then((response) => response.json())
        .then((data: Review) => {
          setReview(data);
        })
        .catch((error) => console.error('Error fetching review data:', error));
    }
  }, [reviewID]);

  useEffect(() => {
    if (review) {
      fetch(`/api/groups/${review.assignmentID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.groups && Array.isArray(data.groups)) {
            setReviewGroups(data.groups);
          } else {
            console.error('Unexpected data structure:', data);
          }
        })
        .catch((error) => console.error('Error fetching group data:', error));

      fetchAssignmentData();
    }

  }, [review]);
  const fetchAssignmentData = async () => {
    const assignmentResponse = await fetch(`/api/assignments/${review?.assignmentID}`);

    if (assignmentResponse.ok) {
      const assignmentData: Assignment = await assignmentResponse.json();
      setAssignment(assignmentData);
    }
  }
  if (!review || loading) {
    return (
      <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>
    );
  }

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }

  const isAdmin = session.user.role === 'admin';

  const handleBackClick = () => { //redirect to course dashboard or all assignments
    const { source } = router.query;
    if (assignment?.courseID) {
      router.push(`/instructor/course-dashboard?courseId=${assignment?.courseID}`);
    } else {
      router.push('/instructor/dashboard');
    }
  };
  const handleHomeClick = () => {
    router.push("/instructor/dashboard");
  };

  const handleRandomizeClick = () => {
    setIsRandomizeModalOpen(true);
  };

  const handleUpdateGroups = async (randomize = false) => {
    const { source, courseId } = router.query;
    const dataToSend = randomize ? null : editableGroups.map(group => ({
      revieweeID: group.reviewee?.studentID,
      reviewers: group.reviewers.map(reviewer => reviewer.studentID)
    }));

    try {
      const response = await fetch('/api/updateTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'reviewGroups',
          data: {
            assignmentID: review.assignmentID,
            courseID: assignment?.courseID,
            groups: dataToSend,
            reviewsPerAssignment,
            randomize,
          },
        }),
      });

      if (response.ok) {
        toast.success("Review groups updated successfully!");
        // Fetch the new review groups and update the state
        const newGroupsResponse = await fetch(`/api/groups/${review.assignmentID}`);
        const newGroupsData = await newGroupsResponse.json();
        if (newGroupsData.groups && Array.isArray(newGroupsData.groups)) {
          setReviewGroups(newGroupsData.groups);
        }
        setIsRandomizeModalOpen(false);
        setIsEditGroupsModalOpen(false);
      } else {
        toast.error("Failed to update review groups");
      }
    } catch (error) {
      console.error("Error updating review groups:", error);
      toast.error("Error updating review groups");
    }
  };

  const handleRelease = async () => {
    if (autoRelease) {
      toast.error("Auto-release is scheduled. Cannot release immediately.");
      return;
    }



    try {

      const response = await fetch('/api/reviews/releaseReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentID: review?.assignmentID, courseId }),
      });

      if (response.ok) {
        toast.success("Review Released successfully!");
        router.back();
      } else {
        console.error('Failed to release assignment for reviews');
      }
    } catch (error) {
      console.error('Error releasing assignment for reviews:', error);
    }
  };

  //handle auto-release of assignment on start date
  const handleAutoReleaseChange = async (checked: boolean) => {
    setAutoRelease(checked);
    if (checked) {
      try {
        const response = await fetch('/api/reviews/scheduleAutoRelease', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignmentID: review?.assignmentID, startDate: review?.startDate }),
        });

        if (response.ok) {
          toast.success("Auto-release scheduled successfully!");
        } else {
          console.error('Failed to schedule auto-release');
        }
      } catch (error) {
        console.error('Error scheduling auto-release:', error);
      }
    }
  };

  const handleAutoRelease = async () => {
    try {
      const startDate = review?.startDate; // Ensure startDate is available
      const response = await fetch('/api/reviews/scheduleAutoRelease', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignmentID: review?.assignmentID, startDate }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error scheduling auto-release:', errorData);
        throw new Error(errorData.message || 'Failed to schedule auto-release');
      }

      toast.success("Auto-release scheduled successfully!");
    } catch (error) {
      console.error('Error scheduling auto-release:', error);
      toast.error("Failed to schedule auto-release. Please try again.");
    }
  };

  const handleEditAssignmentClick = () => {
    setIsModalOpen(true);
  }

  const handleAssignmentsUpdate = async () => {
    try {
      const response = await fetch(`/api/updateTable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: 'reviewDates',
          data: {
            reviewID: reviewID,
            startDate: newStartDate,
            endDate: newEndDate,

            deadline: newDueDate,

            anonymous: newAnonymous,
          }
        })
      }); if (response.ok) {
        console.log("Assignment updated successfully");
        toast.success("Assignment updated successfully");
        setIsModalOpen(false);
        router.reload();
      } else {
        console.error("Failed to update assignment");
        toast.error("Failed to update assignment");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast.error("Error updating assignment");
    }
  };

  // Handle group editing modal open
  const handleEditGroups = () => {
    setEditableGroups([...reviewGroups]);
    setIsEditGroupsModalOpen(true); // Open the modal to edit groups
  };

  const handleMemberClick = (student: StudentDetails, groupID: number, reviewerIndex: number) => {
    if (!student) return;

    if (selectedStudents.length === 0) {
      setSelectedStudents([{ student, groupID, reviewerIndex }]);
    } else if (selectedStudents.length === 1) {
      const [firstSelection] = selectedStudents;
      const targetGroup = editableGroups[groupID];
      const firstSelectionGroup = editableGroups[firstSelection.groupID];

      // Check if the students are already in the target groups
      const studentInTargetGroup = targetGroup.reviewers.some(reviewer => reviewer.studentID === firstSelection.student.studentID);
      const firstSelectionInCurrentGroup = firstSelectionGroup.reviewers.some(reviewer => reviewer.studentID === student.studentID);

      if (firstSelection.student.studentID === student.studentID) {
        // Same student clicked, clear the selection
        setSelectedStudents([]);
      } else if (studentInTargetGroup || firstSelectionInCurrentGroup) {
        // One of the students is already in the target group
        toast.error("One of the students is already in the target group.");
      } else {
        // Swap the groups of the two selected students if they are in different groups
        swapStudentGroups(firstSelection.student, student, firstSelection.groupID, groupID, firstSelection.reviewerIndex, reviewerIndex);
      }
    }
  };

  const handleEmptyGroupClick = (groupID: number, reviewerIndex: number) => {
    if (selectedStudents.length === 1) {
      const [firstSelection] = selectedStudents;
      // Move the student to the new group and remove from the old group
      if (firstSelection.groupID !== groupID || firstSelection.reviewerIndex !== reviewerIndex) {
        moveStudentToGroup(firstSelection.student, firstSelection.groupID, groupID, firstSelection.reviewerIndex, reviewerIndex);
      }
    }
  };

  // Modified function for swapping students
  const swapStudentGroups = (student1: StudentDetails, student2: StudentDetails, group1ID: number, group2ID: number, reviewerIndex1: number, reviewerIndex2: number) => {
    setEditableGroups(prevGroups => {
      const newGroups = prevGroups.map((group, index) => {
        if (index === group1ID || index === group2ID) {
          const reviewers = group.reviewers.slice();
          if (index === group1ID) {
            reviewers[reviewerIndex1] = student2;
          } else {
            reviewers[reviewerIndex2] = student1;
          }
          return { ...group, reviewers };
        }
        return group;
      });
      return newGroups;
    });

    setSelectedStudents([]);
  };

  const moveStudentToGroup = (student: StudentDetails, fromGroupID: number, toGroupID: number, fromReviewerIndex: number, toReviewerIndex: number) => {
    setEditableGroups(prevGroups => {
      const newGroups = prevGroups.map((group, index) => {
        if (index === fromGroupID) {
          const reviewers = group.reviewers.slice();
          reviewers.splice(fromReviewerIndex, 1);
          return { ...group, reviewers };
        } else if (index === toGroupID) {
          const reviewers = group.reviewers.slice();
          reviewers[toReviewerIndex] = student;
          return { ...group, reviewers };
        }
        return group;
      });
      return newGroups;
    });

    setSelectedStudents([]);
  };

  const handleSaveGroups = () => {
    handleUpdateGroups();
  };

  const handleReRandomizeGroups = () => {
    handleUpdateGroups(true);
  };

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className="instructor">
        <div className={styles.container}>
          <div className={styles.header}>
            <h1>{review.reviewID ? `Reviewing ${review.assignmentName}` : "Review Details"}</h1>
            <br />
            <Breadcrumbs>
              <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
              <BreadcrumbItem onClick={handleBackClick}>{courseData ? courseData.courseName : ' Dashboard'}</BreadcrumbItem>
              <BreadcrumbItem>{review.reviewID ? `Review ${review.assignmentName}` : "Review"}</BreadcrumbItem>
            </Breadcrumbs>
          </div>

          <div className={styles.assignmentsSection}>
            <div className="flex">
              <Button className="w-1/3" color="secondary" variant="light" onClick={handleRandomizeClick}>Randomize Review Groups</Button>
              <Button className="w-1/3" color='primary' variant='light' onClick={handleEditAssignmentClick} >Edit Review Dates</Button>
              <Button className="w-1/3" color='success' variant='light' onClick={handleEditGroups} >Edit Groups</Button>
            </div>


            {review && (
              <ReviewDetailCard
                title={`Review ${review.assignmentName}`}
                description={`Assignment: ${review.assignmentName}`}
                deadline={review.deadline}
                startDate={review.startDate}
                endDate={review.endDate}
              />
            )}
            
            <div >
              <h2>Total Review Groups: {reviewGroups.length}</h2>
              <br />
              {reviewGroups.map((group, groupIndex) => (
                <div key={groupIndex} className={styles.courseCards}>
                  <Card className={styles.assignmentCard}>
                    <CardBody>
                      {group.reviewee ? (
                        <>
                          <h3 className={styles.assignmentTitle}>{`Student: ${group.reviewee.firstName} ${group.reviewee.lastName}`}</h3>
                          <div className={styles.assignmentDescription}>
                            {group.reviewers.map((reviewer, reviewerIndex) => (
                              <p key={reviewerIndex}>
                                Assigned submission for: {reviewer.firstName} {reviewer.lastName}, ({reviewer.studentID})
                              </p>
                            ))}
                          </div>
                          <p>Total students in this group: {group.reviewers.length}</p>
                        </>
                      ) : (
                        <p>Group data is not available.</p>
                      )}
                    </CardBody>
                  </Card>
                </div>
              ))}
            </div>
            <div className={styles.notificationsSection}>
              <div className="flex justify-center">
                <Button className="w-1/3" onClick={handleAutoRelease} variant="flat" color='secondary'>
                  Schedule Auto Release
                </Button>
                <Button className="w-1/3" color="primary" variant="solid" onClick={handleRelease}>Release Assignment for Reviews</Button>
              </div>

            </div>
            <Modal
              className='z-20'
              backdrop="blur"
              isOpen={isModalOpen}
              onOpenChange={(open) => setIsModalOpen(open)}
            >
              <ModalContent>
                <ModalHeader>Edit Assignment Details</ModalHeader>
                <ModalBody>
                  <h3>Select New Start Date:</h3>
                  <Input
                    color="success"
                    variant="underlined"
                    size="sm"
                    type="datetime-local"
                    className={styles.textbox}
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <h3>Select New Due Date:</h3>
                  <Input
                    color="warning"
                    variant="underlined"
                    size="sm"
                    type="datetime-local"
                    className={styles.textbox}
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <h3>Select New End Date:</h3>
                  <Input
                    color="danger"
                    variant="underlined"
                    size="sm"
                    type="datetime-local"
                    className={styles.textbox}
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Checkbox
                    isSelected={newAnonymous}
                    onChange={(e) => setNewAnonymous(e.target.checked)}
                  >
                    Anonymous
                  </Checkbox>
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={() => setIsModalOpen(false)}>
                    Close
                  </Button>
                  <Button color="primary" onPress={handleAssignmentsUpdate}>
                    Update
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal
              className='z-20'
              backdrop="blur"
              isOpen={isRandomizeModalOpen}
              onOpenChange={(open) => setIsRandomizeModalOpen(open)}
            >
              <ModalContent>
                <ModalHeader>Re-randomize Review Groups</ModalHeader>
                <ModalBody>
                  <h3>Select number of reviews per assignment:</h3>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={reviewsPerAssignment.toString()}
                    onChange={(e) => setReviewsPerAssignment(Number(e.target.value))}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={() => setIsRandomizeModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button color="primary" onPress={handleReRandomizeGroups}>
                    Re-randomize
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>

            <Modal
              className='z-20'
              backdrop="blur"
              isOpen={isEditGroupsModalOpen}
              onOpenChange={(open) => setIsEditGroupsModalOpen(open)}
            >
              <ModalContent style={{ maxHeight: '90%', overflow: 'auto' }}>
                <ModalHeader>Edit Groups</ModalHeader>
                <ModalBody>
                  {editableGroups.map((group, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <h3>{`Group ${index + 1}: ${group.reviewee?.firstName} ${group.reviewee?.lastName}`}</h3>
                      {group.reviewers.map((reviewer, reviewerIndex) => (
                        <Button
                          key={reviewer.studentID}
                          onPress={() => handleMemberClick(reviewer, index, reviewerIndex)}
                          style={{
                            margin: '5px',
                            backgroundColor: selectedStudents.find(s => s.student.studentID === reviewer.studentID) ? 'lightblue' : undefined
                          }}
                        >
                          {`${reviewer.firstName} ${reviewer.lastName}`}
                        </Button>
                      ))}
                      <Button
                        onPress={() => handleEmptyGroupClick(index, group.reviewers.length)}
                        style={{
                          margin: '5px',
                          backgroundColor: 'lightgreen'
                        }}
                      >
                        Move Here
                      </Button>
                    </div>
                  ))}
                </ModalBody>
                <ModalFooter>
                  <Button color="primary" variant="light" onPress={() => setIsEditGroupsModalOpen(false)}>
                    Close
                  </Button>
                  <Button color="primary" onPress={handleSaveGroups}>
                    Save
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}
