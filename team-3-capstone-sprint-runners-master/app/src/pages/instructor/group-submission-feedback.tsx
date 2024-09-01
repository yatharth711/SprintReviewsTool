// instructor/group-submission-feedback.tsx
import { useRouter } from "next/router";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import { useEffect, useState } from "react";
import { useSessionValidation } from "../api/auth/checkSession";
import InstructorGroupDetails from "../components/instructor-components/instructor-group-feedback";
import styles from "../../styles/AssignmentDetailCard.module.css";
import { Button, Breadcrumbs, BreadcrumbItem, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Card, CardBody, Table, TableBody, TableColumn, TableHeader, TableRow, TableCell } from "@nextui-org/react";
import toast from "react-hot-toast";
import DownloadSubmission from "../components/student-components/download-submission";

interface Assignment {
  assignmentID: number;
  title: string;
  descr: string;
  startDate: string;
  endDate: string;
  deadline: string;
  allowedFileTypes: string;
  groupAssignment: boolean;
  courseID: string;
}

interface CourseData {
  courseID: string;
  courseName: string;
}

interface GroupDetails {
  groupID: number;
  students: { studentID: number; firstName: string; lastName: string }[];
}

interface Feedback {
  revieweeID: number;
  reviewerID: number;
  score: string;
  content: string;
}
interface GroupFeedback {
  feedbackID: number;
  submissionID: number;
  reviewerID: number;
  feedbackDetails: string;
  feedbackDate: string;
  lastUpdated: string;
  comment: string;
  grade: number | null;
  feedbackType: 'peer' | 'instructor';
}
interface Submission {
  studentName: string;
  submissionID: number;
  assignmentID: number;
  studentID: number;
  fileName: string;
  submissionDate: string;
  autoGrade: number;
  grade: number;
  isLate: boolean;
  isSubmitted: boolean;
}

export default function AssignmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const studentID = parseInt(router.query.studentID as string);
  const assignmentID = parseInt(router.query.assignmentID as string);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState<number>(0);
  const [groupFeedbacks, setgroupFeedbacks] = useState<GroupFeedback[]>([]);
  useSessionValidation('instructor', setLoading, setSession);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchData = async () => {
      if (assignmentID) {
        try {
          const assignmentResponse = await fetch(`/api/assignments/${assignmentID}`);
          if (assignmentResponse.ok) {
            const assignmentData: Assignment = await assignmentResponse.json();
            setAssignment(assignmentData);

            if (assignmentData.courseID) {
              const courseResponse = await fetch(`/api/courses/${assignmentData.courseID}`);
              if (courseResponse.ok) {
                const courseData: CourseData = await courseResponse.json();
                setCourseData(courseData);
              }
            }

            if (assignmentData.groupAssignment) {
              const groupResponse = await fetch(`/api/groups/getGroupDetails?courseID=${assignmentData.courseID}&userID=${studentID}`);
              if (groupResponse.ok) {
                const groupData: GroupDetails = await groupResponse.json();
                setGroupDetails(groupData);
              }
            }
          } else {
            console.error('Error fetching assignment data');
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, router.query]);

  useEffect(() => {
    const checkSubmissionStatus = async () => {
      if (assignmentID && studentID) {
        try {
          const response = await fetch(`/api/submissions/checkSubmission4Instructor?assignmentID=${assignmentID}&userID=${studentID}`);
          if (!response.ok) {
            throw new Error('Failed to check submission status');
          }
          const data: Submission = await response.json();
          setSubmission(data);
          console.log('Submission data: ', data);
          setNewGrade(data.grade ?? data.autoGrade);

          
        } catch (error) {
          console.error('Error checking submission status:', error);
          toast.error('Error checking submission status. Please refresh the page.');
        }
      }
    };

    const checkFeedbackStatus = async () => {
      if (assignmentID) {
        try {
          const response = await fetch(`/api/groups/getFeedbackStatus?assignmentID=${assignmentID}&reviewerID=${studentID}`);
          if (!response.ok) {
            throw new Error('Failed to check feedback status');
          }
          const data = await response.json();
          setIsFeedbackSubmitted(data.isFeedbackSubmitted);
          
          
        } catch (error) {
          console.error('Error checking feedback status:', error);
          toast.error('Error checking feedback status. Please refresh the page.');
        }
      }
    };

    const fetchFeedback = async () => {
      if (assignmentID && groupDetails) {
        try {
          const response = await fetch(`/api/groups/getSubmittedFeedback?assignmentID=${assignmentID}&studentID=${studentID}`);
          if (!response.ok) {
            throw new Error('Failed to fetch feedback');
          }
          const data = await response.json();
          setFeedback(data);
          
          const feedbacksResponse = await fetch(`/api/peer-reviews/${assignmentID}/${studentID}`);
            if (feedbacksResponse.ok) {
              const feedbacksData: GroupFeedback[] = await feedbacksResponse.json();
              setgroupFeedbacks(feedbacksData);
            }
        } catch (error) {
          console.error('Error fetching feedback:', error);
          toast.error('Error fetching feedback. Please refresh the page.');
        }
      }
    };

    checkSubmissionStatus();
    checkFeedbackStatus();
    fetchFeedback();
  }, [assignmentID, groupDetails]);

  const handleEditGrade = () => {
    setIsModalOpen(true);
  };

  const handleSaveGrade = async (newGrade: number) => {
    try {
      if (submission?.submissionID === null) {
        throw new Error('Cannot update grade for an un-submitted assignment');
      }
      const response = await fetch('/api/updateTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'submission',
          data: {
            grade: newGrade,
            submissionID: submission?.submissionID,
          },
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update grade');
      }
  
      setSubmission((prev) => prev ? { ...prev, grade: newGrade } : null);
      toast.success('Grade updated successfully');
    } catch (error) {
      if ((error as Error).message === 'Cannot update grade for an un-submitted assignment') {
        toast.error('Cannot update grade for an un-submitted assignment.');
      } else {
        console.error('Error updating grade:', error);
        toast.error('Error updating grade. Please try again.');
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!assignment || loading) {
    return (
      <div className="w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  const handleAssignmentClick = () => router.push(`/instructor/group-assignment-dashboard?assignmentID=${assignment.assignmentID}`);
  const handleCourseClick = () => router.push(`/instructor/course-dashboard?courseId=${courseData?.courseID}`);
  const handleHomeClick = () => router.push("/instructor/dashboard");

  return (
    <>
      <InstructorNavbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>{assignment.title || "Assignment Name- Details"}</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleCourseClick}>{courseData?.courseName}</BreadcrumbItem>
            <BreadcrumbItem onClick={handleAssignmentClick}>{assignment.title}</BreadcrumbItem>
            <BreadcrumbItem>
              {`Group ${groupDetails?.groupID}` || "Group Submission Feedback"}
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.assignmentsSection}>
            <Card className={`overflow-y-auto min-h-[110px] ${styles.assignmentCard}`}>
                <CardBody>
                <h2 className={styles.assignmentTitle}>{assignment.title} - (Submitted by: {submission?.studentName})</h2>
                <p className={styles.assignmentDescription}>{assignment.descr}</p>
                <p className={styles.assignmentDeadline}>Deadline: {new Date(assignment.deadline).toLocaleString()}</p>
                </CardBody>
            </Card>
          {submission?.isSubmitted ? (
            <div>
              <p className={submission.isLate ? "text-primary-900 text-large font-bold bg-danger-200 my-2 p-1" : "text-primary-900 text-large font-bold bg-success-300 my-2 p-1"}>
                {submission.isLate
                  ? "Assignment Submitted Late"
                  : "Assignment Submitted"}
              </p>
              {submission.fileName && <p className="text-left mt-3 "><DownloadSubmission assignmentID={assignment.assignmentID} studentID={Number(studentID)}></DownloadSubmission></p>}
              <div className="flex items-center mb-0">
                <p className="text-primary-900 text-large font-bold m-2 mr-3 p-1">
                  {submission?.grade ? 'Adjusted Grade:' : 'Average Grade:'} {submission?.grade ?? submission?.autoGrade}
                </p><Button size="sm" variant="flat" color="warning" onClick={handleEditGrade}>Edit Grade</Button>
              </div>
            </div>
          ) : (
            <p className="text-primary-900 text-large font-bold bg-danger-500 my-2 p-1">Assignment Not Submitted</p>
          )}
          <br /><br />
          {groupDetails && (
            <div className="m-0">
              <InstructorGroupDetails 
              groupID={groupDetails.groupID}
              studentName={submission?.studentName}
              students={groupDetails.students}
              feedbacks={feedback}
            />
            </div>
            
          )}
          <h2 className="mt-8 mb-3">Feedback</h2>
          <Table aria-label="Submissions table">
          <TableHeader>
              <TableColumn>Reviewer ID</TableColumn>
              <TableColumn>Feedback Date</TableColumn>
              <TableColumn>Comment</TableColumn>              
              <TableColumn>Last Updated</TableColumn>

            </TableHeader>
            <TableBody>
          {groupFeedbacks.map((feedback, index) => (
                <TableRow key={index}>
                  <TableCell>{feedback.reviewerID}</TableCell>
                  <TableCell>{new Date(feedback.feedbackDate).toLocaleString()}</TableCell>
                  <TableCell>{feedback.comment}</TableCell>                  
                  <TableCell>{new Date(feedback.lastUpdated).toLocaleString()}</TableCell>
                </TableRow>

          ))}
            </TableBody>
          </Table>
        </div>
        
      </div>
      <Modal
        className='z-20'
        backdrop="blur"
        isOpen={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
      >
        <ModalContent>
          <ModalHeader>Edit Grade</ModalHeader>
          <ModalBody>
            <Input
              type="number"
              fullWidth
              label="New Grade"
              value={newGrade?.toString()}
              onChange={(e) => setNewGrade(Number(e.target.value))}
              min={0}
              max={100}
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="light" onPress={closeModal}>
              Cancel
            </Button>
            <Button color="primary" onPress={() => { handleSaveGrade(newGrade); closeModal(); }}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* <div>
            <h2>Feedback</h2>
            {groupFeedbacks.length > 0 ? (
              groupFeedbacks.map((groupFeedback, index) => (
                <div key={groupFeedback.feedbackID} className={styles.assignmentsSection}>
                  <p><strong>Feedback {index + 1}:</strong></p>
                  <p><strong>Details:</strong> {groupFeedback.feedbackDetails}</p>
                  <p><strong>Comment:</strong> {groupFeedback.comment}</p>
                  <p><strong>Date:</strong> {new Date(groupFeedback.feedbackDate).toLocaleString()}</p>
                  <p><strong>Grade:</strong> {groupFeedback.grade !== null ? feedback.grade : "Not graded yet"}</p>
                </div>
              ))
            ) : (
              <p>No feedback available yet.</p>
            )}
          </div> */}
      
        
        {/* <tbody>
          {groupFeedbacks.map((feedback, index) => (
            <tr key={index}>
              <td>{feedback.feedbackID}</td>
              <td>{feedback.submissionID}</td>
              <td>{feedback.reviewerID}</td>
              <td>{feedback.feedbackDetails}</td>
              <td>{feedback.feedbackDate}</td>
              <td>{feedback.lastUpdated}</td>
              <td>{feedback.comment}</td>
              <td>{feedback.grade}</td>
              <td>{feedback.feedbackType}</td>
            </tr>
          ))}
        </tbody>
      </table> */}
    </>
  );
}