// instructor/submission-feedback.tsx
import { useRouter } from "next/router";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import { useEffect, useState } from "react";
import { useSessionValidation } from "../api/auth/checkSession";
import AssignmentDetailCard from "../components/student-components/student-assignment-details";
import styles from "../../styles/AssignmentDetailCard.module.css";
import { Button, Breadcrumbs, BreadcrumbItem, Spinner, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";
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
  courseID: string;
}

interface CourseData {
  courseID: string;
  courseName: string;
}

interface Feedback {
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
  fileNames: string[];
  links: string[];
  submissionDate: string;
  autoGrade: number;
  grade: number;
  isLate: boolean;
  isSubmitted: boolean;
}
interface Comment {
  feedbackID: number;
  comment: string;
  feedbackDate: string;
  lastUpdated: string;
}
export default function AssignmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const router = useRouter();
  const { assignmentID, studentID } = router.query;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGrade, setNewGrade] = useState<number>(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");
  useSessionValidation("instructor", setLoading, setSession);

  useEffect(() => {
    if (!router.isReady || !studentID) return;

    checkSubmissionStatus();

    const fetchData = async () => {
      if (assignmentID && studentID) {
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

            // Fetch feedbacks for this assignment and student
            const feedbacksResponse = await fetch(`/api/peer-reviews/${assignmentID}/${studentID}`);
            if (feedbacksResponse.ok) {
              const feedbacksData: Feedback[] = await feedbacksResponse.json();
              setFeedbacks(feedbacksData);
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
    const fetchComments = async () => {
      if (assignmentID && studentID) {
        try {
          const response = await fetch(`/api/instructorComments/${assignmentID}/${studentID}`);
          if (response.ok) {
            const commentsData: Comment[] = await response.json();
            setComments(commentsData);
          } else {
            console.error('Error fetching comments');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    };
    fetchComments();
    fetchData();
  }, [router.isReady, studentID, assignmentID]);

  const checkSubmissionStatus = async () => {
    if (assignmentID && studentID) {
      try {
        const response = await fetch(`/api/submissions/checkSubmission4Instructor?assignmentID=${assignmentID}&userID=${studentID}`);
        if (!response.ok) {
          throw new Error('Failed to check submission status');
        }
        const data = await response.json();

        setSubmission(data);
        setNewGrade(data.grade ?? data.autoGrade);
        console.log('Submission data:', data);
      } catch (error) {
        console.error('Error checking submission status:', error);
        toast.error('Error checking submission status. Please refresh the page.');
      }
    }
  };

  const handleEditGrade = () => {
    setIsModalOpen(true);
  };

  const handleSaveGrade = async (newGrade: number) => {
    try {
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
      console.error('Error updating grade:', error);
      toast.error('Error updating grade. Please try again.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleAddComment = async () => {
    try {
      const response = await fetch('/api/instructorComments/addFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          assignmentID: assignment?.assignmentID,
          courseID: courseData?.courseID,
          studentID: studentID,
          comment: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const newCommentData: Comment = await response.json();
      setComments((prev) => [...prev, newCommentData]);
      setNewComment('');
      toast.success('Comment added successfully');
      router.reload();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment. Please try again.');
    }
  };

  const handleEditComment = (commentId: number, currentComment: string) => {
    setEditingCommentId(commentId);
    setEditedComment(currentComment);

  };

  const handleSaveEditedComment = async () => {
    try {
      const response = await fetch('/api/instructorComments/addFeedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          feedbackID: editingCommentId,
          comment: editedComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update comment');
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.feedbackID === editingCommentId
            ? { ...comment, comment: editedComment, lastUpdated: new Date().toISOString() }
            : comment
        )
      );
      setEditingCommentId(null);
      setEditedComment('');
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error updating comment. Please try again.');
    }
  };

  if (!assignment || loading) {
    return (
      <div className="w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  const handleAssignmentClick = () => router.push(`/instructor/assignment-dashboard?assignmentID=${assignment.assignmentID}`);
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
              {submission?.studentName || "Submission details"}

            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.assignmentsSection}>
          {assignment && (
            <>
              <AssignmentDetailCard
                description={assignment.descr || "No description available"}
                startDate={new Date(assignment.startDate).toLocaleString() || "No start date set"}
                endDate={new Date(assignment.endDate).toLocaleString() || "No end date set"}
                deadline={new Date(assignment.deadline).toLocaleString() || "No deadline set"}
                allowedFileTypes={assignment.allowedFileTypes}
              />
              {/* <div className="flex justify-between items-center my-2"> */}
              <p className="text-left mt-3 "><DownloadSubmission assignmentID={assignment.assignmentID} studentID={Number(studentID)}></DownloadSubmission></p>

            </>

          )}
          {submission && submission.isSubmitted ? (
            <div>
              <p className={submission.isLate ? "text-primary-900 text-large font-bold bg-danger-200 my-2 p-1" : "text-primary-900 text-large font-bold bg-success-300 my-2 p-1"}>
                {submission.isLate
                  ? `${submission?.studentName} - Assignment Submitted Late`
                  : `${submission?.studentName} - Assignment Submitted`}
              </p>
              {/* {submission.fileName && <p className="text-left text-small">Submitted file: {submission.fileName}</p>} */}
              <div className="flex items-center">
                <p className="text-primary-900 text-large font-bold my-2 mr-3 p-1">
                  {submission?.grade ? 'Adjusted Grade:' : 'Average Grade:'} {submission?.grade ?? submission?.autoGrade} %
                </p><Button size="sm" variant="flat" color="warning" onClick={handleEditGrade}>Edit Grade</Button>
              </div>
            </div>
          ) : (
            <p className="text-primary-900 text-large font-bold bg-danger-500 my-2 p-1">{submission?.studentName} - Assignment Not Submitted</p>
          )}
          <div className="instructor flex justify-evenly align-top">
            <div className="w-1/2 align-top justify-start items-start">
              {/* <h2 className=" mb-3 align-top items-start">Feedback</h2> */}
              {feedbacks.length > 0 ? (
                // feedbacks.map((feedback, index) => (
                //   <div key={feedback.feedbackID} className={styles.assignmentsSection}>
                //     <p><strong>Feedback {index + 1}:</strong></p>
                //     <p><strong>Details:</strong> {feedback.feedbackDetails}</p>
                //     <p><strong>Comment:</strong> {feedback.comment}</p>
                //     <p><strong>Date:</strong> {new Date(feedback.feedbackDate).toLocaleString()}</p>
                //     <p><strong>Grade:</strong> {feedback.grade !== null ? feedback.grade : "Not graded yet"}</p>
                //   </div>
                // ))
                <div>
                  <h2 className="mt-8 mb-2 lign-top items-start">Feedback</h2>
                  <Table aria-label="Submissions table">
                    <TableHeader>
                      <TableColumn>Reviewer ID</TableColumn>
                      <TableColumn>Feedback Date</TableColumn>
                      <TableColumn>Comment</TableColumn>
                      <TableColumn>Last Updated</TableColumn>

                    </TableHeader>
                    <TableBody>
                      {feedbacks.map((feedback, index) => (
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
              ) : (
                <p>No feedback available yet.</p>
              )}
            </div>

            <div className="w-1/2 justify-between">
              <h2>Comments</h2>
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.feedbackID} className={styles.comment}>
                    {editingCommentId === comment.feedbackID ? (
                      <>
                        <Input
                          type="text"
                          fullWidth
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                        />
                        <Button color="primary" onPress={handleSaveEditedComment}>Save</Button>
                        <Button color="secondary" onPress={() => setEditingCommentId(null)}>Cancel</Button>
                      </>
                    ) : (
                      <div className="flex">
                      <div className="flex-col text-left text-medium mr-auto">
                        <p>{comment.comment}</p>
                        <p>Date: {new Date(comment.feedbackDate).toLocaleString()}</p>
                      </div>
                        <div className="flex-col text-right ">
                          {comment.lastUpdated && <p>Last Updated: {new Date(comment.lastUpdated).toLocaleString()}</p>}
                        <Button size="sm" color="secondary" onPress={() => handleEditComment(comment.feedbackID, comment.comment)}>Edit</Button>
                        </div>
                        
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p>No comments available yet.</p>
              )}
              <br />
              <div className="flex items-center">
                <Input
                size="sm"
                type="text"
                fullWidth
                label="New Comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <Button color="primary" onPress={handleAddComment}>Add Comment</Button>
              </div>
              
            </div>
            
              
            
          </div>
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
    </>
  );
}