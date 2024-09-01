// student/all-assignments.tsx
import { useRouter } from "next/router";
import styles from '../../styles/instructor-course-dashboard.module.css';
import { Breadcrumbs, BreadcrumbItem, Divider, Checkbox, CheckboxGroup, Spinner } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useSessionValidation } from '../api/auth/checkSession';
import StudentNavbar from "../components/student-components/student-navbar";
import StudentAssignmentCard from "../components/student-components/student-assignment-card";

interface Assignment {
  assignmentID: number;
  title: string;
  descr: string;
  deadline: string;
  groupAssignment: boolean;
  courseName: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [session, setSession] = useState<any>(null);
  const [selectedAssignmentTypes, setSelectedAssignmentTypes] = useState<string[]>(['all']);

  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    if (session && session.user && session.user.userID) {
      fetchAssignments(session.user.userID);
    }
  }, [session]);

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }

  const fetchAssignments = async (userID: string) => {
    try {
      const response = await fetch(`/api/getAllAssignmentsStudent?userID=${userID}`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      } else {
        console.error('Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

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

  if (loading) {
    return (
      <div className='w-[100vw] h-[100vh] flex justify-center items-center'>
        <Spinner color='primary' size="lg" />
      </div>
    );
  }

  const handleHomeClick = async () => {
    router.push('/instructor/dashboard');
  }

  const individualAssignments = assignments.filter(assignment => !assignment.groupAssignment && !assignment.title.toLowerCase().includes('peer review'));
  const groupAssignments = assignments.filter(assignment => assignment.groupAssignment);
  const peerReviews = assignments.filter(assignment => assignment.title.toLowerCase().includes('peer review'));

  const renderAssignments = (assignments: Assignment[], title: string, color: string, isGroup: boolean) => (
    <>
      <h3 className={styles.innerTitle}>{title}</h3>
      <br />
      <Divider className="instructor bg-secondary" />
      <br />
      <div className={styles.courseCard}>
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <div key={assignment.assignmentID} className={styles.courseCard}>
              <StudentAssignmentCard
                courseID={assignment.assignmentID}
                assignmentName={assignment.title}
                courseName={assignment.courseName}
                deadline={new Date(assignment.deadline).toLocaleString()}
                color={color}
                groupAssignment={isGroup}
              />
            </div>
          ))
        ) : (
          <p>No {title.toLowerCase()} found.</p>
        )}
      </div>
    </>
  );

  const shouldRenderAssignments = (type: string) => {
    return selectedAssignmentTypes.includes('all') || selectedAssignmentTypes.includes(type);
  };

  return (
    <>
      <StudentNavbar />
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>All Assignments</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem>Assignments</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={`flex-col bg-white p-[1%] w-[86%] m-[.8%] ml-auto h-[100%]` }>
            <CheckboxGroup
              label="Select assignment type:"
              orientation="horizontal"
              color="primary"
              size="sm"
              className="text-left flex-row mb-2 text-primary-900"
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

            {shouldRenderAssignments('individual') && renderAssignments(individualAssignments, 'Individual Assignments', '#b3d0c3', false)}
            {shouldRenderAssignments('group') && renderAssignments(groupAssignments, 'Group Assignments', '#b3d0c3', true)}
            {shouldRenderAssignments('peerReviews') && renderAssignments(peerReviews, 'Peer Reviews', '#72a98f', false)}
          </div>
          
        </div>
      </div>
    </>
  );
}
