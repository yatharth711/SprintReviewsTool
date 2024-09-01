import StudentNavbar from "../components/student-components/student-navbar";
import styles from '../../styles/instructor-course-dashboard.module.css';
import { Breadcrumbs, BreadcrumbItem, Spinner, Card, CardBody, Divider, Button, Input, Pagination, CardHeader } from "@nextui-org/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useSessionValidation } from "../api/auth/checkSession";
import submitReviews from "../api/reviews/submitReviews";
import dayjs from "dayjs";
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

interface ReviewCriterion {
  criteriaID: number;
  criterion: string;
  maxMarks: number;
}

interface Submission {
  revieweeID: number;
  assignmentID: number;
  studentID: number;
  fileName: string;
  fileType: string;
  submissionDate: string;
  studentName?: string;
  deadline: string;
  isSubmitted: boolean;
  isLate: boolean;
}

export default function ReviewDashboard() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [reviewCriteria, setReviewCriteria] = useState<ReviewCriterion[]>([]);
  const [submissionsToReview, setSubmissionsToReview] = useState<Submission[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewGrades, setReviewGrades] = useState<{ [studentID: number]: { [criteriaID: number]: string } }>({});
  const [reviewComments, setReviewComments] = useState<{ [studentID: number]: string }>({});
  const router = useRouter();
  const { assignmentID } = router.query;
  const [error, setError] = useState<string | null>(null);
  const [deadlinePassed, setDeadlinePassed] = useState<boolean>(false);
  const [autoReleaseDate, setAutoReleaseDate] = useState<Date | null>(null);
  const [buttonVisible, setButtonVisible] = useState(true);
  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    if (!router.isReady || !session) return;
    const fetchData = async () => {
      const userID = session.user?.userID;
      if (!assignmentID || !userID) {
        setError('Missing assignmentID or userID');
        setLoading(false);
        return;
      }
  
      try {
        const [assignmentResponse, reviewResponse] = await Promise.all([
          fetch(`/api/assignments/${assignmentID}`),
          fetch(`/api/review-dashboard/${assignmentID}?userID=${userID}`)
        ]);
  
        if (assignmentResponse.ok && reviewResponse.ok) {
          const [assignmentData, reviewData] = await Promise.all([
            assignmentResponse.json(),
            reviewResponse.json()
          ]);
  
          setAssignment(assignmentData);
          setReviewCriteria(reviewData.reviewCriteria);
  
          const reviewSubmissions = await Promise.all(reviewData.submissions.map(async (submission: Submission) => {
            const submissionResponse = await fetch(`/api/submissions/checkPRSubmission?assignmentID=${assignmentID}&userID=${userID}`);
            const submissionData = await submissionResponse.json();
            return {
              ...submission,
              ...submissionData.submissions.find((s: any) => s.studentID === submission.studentID),
            };
          }));
          setSubmissionsToReview(reviewSubmissions);
  
          if (assignmentData.courseID) {
            const courseResponse = await fetch(`/api/courses/${assignmentData.courseID}`);
            if (courseResponse.ok) {
              const courseData = await courseResponse.json();
              setCourseData(courseData);
              setCourseName(courseData.courseName);
            }
          }
  
          // Initialize reviewGrades and reviewComments state
          const initialGrades = reviewSubmissions.reduce((acc: any, submission: Submission) => {
            acc[submission.studentID] = reviewGrades[submission.studentID] || {};
            return acc;
          }, {});
          setReviewGrades(initialGrades);
  
          const initialComments = reviewSubmissions.reduce((acc: any, submission: Submission) => {
            acc[submission.studentID] = reviewComments[submission.studentID] || '';
            return acc;
          }, {});
          setReviewComments(initialComments);
  
          // Check if deadline has passed
          const currentSubmission = reviewSubmissions[currentPage - 1];
          const assignmentDeadline = currentSubmission ? dayjs(currentSubmission.deadline) : null;
          const currentDate = dayjs();
          setDeadlinePassed(currentDate.isAfter(assignmentDeadline));
  
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [router.isReady, session, assignmentID, currentPage]);
  
  const handleHomeClick = () => router.push("/student/dashboard");

  const handleBackClick = () => {
    if (courseData?.courseID != null) {
      router.push(`/student/course-dashboard?courseId=${courseData?.courseID}`);
    } else {
      router.push('/student/all-assignments');
    }
  };
  

  const handleGradeChange = (revieweeID: number, criteriaID: number, value: string) => {
    setReviewGrades(prev => ({
      ...prev,
      [revieweeID]: {
        ...prev[revieweeID],
        [criteriaID]: value
      }
    }));
  };

  const handleCommentChange = (revieweeID: number, value: string) => {
    setReviewComments(prev => ({
      ...prev,
      [revieweeID]: value
    }));
  };

  const validateAllSubmissions = () => {
    for (const submission of submissionsToReview) {
      if (submission.isSubmitted) {
        const grades = reviewGrades[submission.studentID];
        const comment = reviewComments[submission.studentID];
        if (!grades || !comment) {
          return false;
        }
        for (const criterion of reviewCriteria) {
          if (!grades[criterion.criteriaID]) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const submitReviews = async (assignmentID: number | undefined, reviews: { revieweeID: number; feedbackDetails: { criteriaID: number; grade: number; }[]; comment: string; }[]) => {
    try {
      const response = await fetch('/api/reviews/submitReviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentID,
          reviews,
          userID: session.user?.userID,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reviews');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error submitting reviews:', error);
      throw error;
    }
  };

  const handleSubmitAllReviews = async () => {
    if (!validateAllSubmissions()) {
      toast.error("Please fill out all grades and comments for submitted assignments before submitting reviews.");
      return;
    }

    const assignmentID = assignment?.assignmentID;
    const reviews = submissionsToReview
      .filter(submission => submission.isSubmitted)
      .map(submission => ({
        revieweeID: submission.studentID,
        feedbackDetails: reviewCriteria.map(criterion => ({
          criteriaID: criterion.criteriaID,
          grade: Number(reviewGrades[submission.studentID][criterion.criteriaID])
        })),
        comment: reviewComments[submission.studentID]
      }));

    try {
      const result = await submitReviews(assignmentID, reviews);
      console.log(result.message);
      toast.success(result.message);
      setButtonVisible(false);
      router.push('/student/dashboard');
    } catch (error) {
      console.error('Failed to submit reviews:', error);
      toast.error(`Error submitting reviews: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="w-[100vh=w] h-[100vh] student flex justify-center text-center items-center my-auto">
        <Spinner color="primary" size="lg" />
      </div>
    );
  }

  const checkSubmissionStatus = (submissionDate: string, deadline: string) => {
    const submission = dayjs(submissionDate);
    const dueDate = dayjs(deadline);
    return submission.isBefore(dueDate) ? 'Review submission available' : 'Submitted late';
  };
  
  if (error) {
    return <div>Error: {error}</div>;
  }

  const currentSubmission = submissionsToReview[currentPage - 1];

  

  return (
    <>
      <StudentNavbar />
      <div className={`student text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h2>Reviewing Assignment: {assignment?.title || "Assignment Details"}</h2>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleBackClick}>{courseName}</BreadcrumbItem>
            <BreadcrumbItem>
              Review for {assignment?.title || "Assignment Name"}
            </BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={` ${styles.mainContent}`}>
        <div className={`student flex-col bg-white p-[1%] w-[86%] m-[.8%] ml-auto h-[100%] overflow-auto`}>
        {currentSubmission && (
          <>
            <div className="mb-4 flex-col text-left w-[100%] bg-white shadow-sm p-2">
              <p>{currentSubmission.studentName ? `Student Name: ${currentSubmission.studentName}` : 'Student has not submitted the assignment yet'}</p>
              
              <p>Submission Deadline: {new Date(currentSubmission.deadline).toLocaleString()}</p>
              {currentSubmission.isSubmitted && (
                <p>Submission Status: {currentSubmission.isLate ? 'Late' : 'On Time'}</p>
              )}
              <p className="student"><DownloadSubmission assignmentID={Number(assignmentID)} studentID={currentSubmission.studentID}></DownloadSubmission></p>
            </div>
              <Card>
                <CardHeader>Review Criteria</CardHeader>
                <Divider />
                <CardBody>
                  {currentSubmission.isSubmitted ? (
                    <>
                      {reviewCriteria.map((criterion) => (
                        <div key={criterion.criteriaID} className="flex flex-col mb-4">
                          <div className="flex justify-between mb-2">
                            <span>{criterion.criterion}</span>
                            <span>Max marks: {criterion.maxMarks}</span>
                          </div>
                          
                          <Input
                            type="number"
                            // label={`Grade for ${criterion.criterion}`}
                            placeholder="Enter grade"
                            value={reviewGrades[currentSubmission.studentID]?.[criterion.criteriaID] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (Number(value) > criterion.maxMarks) {
                                toast.error(`Grade cannot exceed max marks of ${criterion.maxMarks}`);
                                return;
                              }
                              handleGradeChange(currentSubmission.studentID, criterion.criteriaID, value);
                            }}
                            max={criterion.maxMarks}
                            min={0}
                            step="1"
                            onKeyDown={(e) => {
                              if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                      ))}
                      <div className="flex flex-col mb-4">
                        <Input
                          type="text"
                          label="Comments"
                          placeholder="Enter your comments"
                          value={reviewComments[currentSubmission.studentID] || ''}
                          onChange={(e) => handleCommentChange(currentSubmission.studentID, e.target.value)}
                          required={reviewCriteria.some(criterion => criterion.maxMarks === 0)}
                        />
                      </div>
                    </>
                  ) : (
                    <p>Student has not submitted the assignment yet</p>
                  )}
                  {currentSubmission.isSubmitted && (
                    <p>{checkSubmissionStatus(currentSubmission.submissionDate, currentSubmission.deadline)}</p>
                  )}
                </CardBody>
              </Card>
            </>
          )}
          <br />
          <div className="text-center justify-center mx-auto">
            <Pagination
            size="sm"
          color="secondary"
          variant="light"
            total={submissionsToReview.length}
            initialPage={1}
            onChange={(page) => setCurrentPage(page)}
            // current={currentPage}
          />
          </div>
          
          <br />
          {!deadlinePassed && currentSubmission?.isSubmitted && checkSubmissionStatus(currentSubmission.submissionDate, currentSubmission.deadline) && buttonVisible && (
            <Button className="w-[100%]" color='primary' variant="solid" onClick={handleSubmitAllReviews}>
              Submit All Reviews
            </Button>
          )}
        </div>
        </div>
      </div>
    </>
  );
  
  
  
}