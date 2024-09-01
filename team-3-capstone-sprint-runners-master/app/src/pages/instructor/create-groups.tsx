// create-groups.tsx
import { useRouter } from "next/router";
import AdminNavbar from "../components/admin-components/admin-navbar";
import InstructorNavbar from "../components/instructor-components/instructor-navbar";
import styles from '../../styles/instructor-course-dashboard.module.css';
import { Button, Breadcrumbs, BreadcrumbItem, Listbox, ListboxItem, Card, Accordion, AccordionItem, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Spinner } from "@nextui-org/react";
import { useSessionValidation } from '../api/auth/checkSession';
import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";

interface Assignment {
  assignmentID: number;
  title: string;
  description: string;
  deadline: string;
  courseID: number;
}

interface Student {
  studentID: number;
  firstName: string;
  lastName: string;
}

interface Group {
  groupID: number;
  groupName: string;
  members: Student[];
}

export default function CreateGroup() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editableGroups, setEditableGroups] = useState<Group[]>([]);
  const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState(false);
  const [isEditGroupsModalOpen, setIsEditGroupsModalOpen] = useState(false);
  const [isRemoveGroupsModalOpen, setIsRemoveGroupsModalOpen] = useState(false);
  const [groupSize, setGroupSize] = useState<number>(3); // Default group size
  const [selectedStudents, setSelectedStudents] = useState<{ student: Student, groupID: number }[]>([]);
  const { courseId } = router.query;

  const [courseName, setCourseName] = useState<string>("");
  
  useSessionValidation('instructor', setLoading, setSession);

  useEffect(() => {
    if (session && session.user && session.user.userID && courseId) {
      fetchStudentsAndGroups(courseId as string);
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

  const fetchStudentsAndGroups = async (courseId: string) => {
    try {
      const studentsResponse = await fetch(`/api/courses/getCourseList?courseID=${courseId}`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData || []);

        const groupsResponse = await fetch(`/api/groups/getCourseGroups?courseID=${courseId}`);
        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json();

          // Transform flat group data into nested group structure
          const groupsMap = new Map<number, Group>();

          groupsData.forEach((item: { groupID: number; studentID: number; courseID: number }) => {
            if (!groupsMap.has(item.groupID)) {
              groupsMap.set(item.groupID, { groupID: item.groupID, groupName: `Group ${item.groupID}`, members: [] });
            }

            const group = groupsMap.get(item.groupID);
            const student = studentsData.find((student: Student) => student.studentID === item.studentID);

            if (group && student) {
              group.members.push(student);
            }
          });

          const groupsArray = Array.from(groupsMap.values());
          setGroups(groupsArray);
        } else {
          console.error('Failed to fetch groups');
        }
      } else {
        console.error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students and groups:', error);
    }
  };

  const fetchRandomizedGroups = async (groupSize: number) => {
    try {
      const studentIds = students.map(student => student.studentID);
      const response = await fetch(`/api/groups/randomizeGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupSize, studentIds }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.groups) {
          const newGroups = data.groups.map((group: { id: number, members: number[] }, index: number) => ({
            groupID: group.id,
            groupName: `Group ${index + 1}`,
            members: group.members.map(id => {
              const student = students.find(student => student.studentID === id);
              return student ? student : null;
            }).filter(student => student !== null) as Student[],
          }));
          setGroups(newGroups);
        } else {
          console.error('Data.groups is undefined');
        }
        setIsRandomizeModalOpen(false); // Close the modal after successful group randomization
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch randomized groups', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error fetching randomized groups:', error);
    }
  };

  const handleCreateGroups = async () => {
    const groupsData = groups.map((group, index) => {
      return {
        groupNumber: index + 1,
        studentIDs: group.members.map(member => member.studentID),
        groupID: group.groupID,
      };
    });

    try {
      const response = await fetch(`/api/groups/createGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groups: groupsData, courseID: courseId }),
      });

      if (response.ok) {
        toast.success('Groups created successfully');
        router.push(`/instructor/course-dashboard?courseId=${courseId}`);
      } else {
        const errorData = await response.json();
        console.error('Failed to create groups', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error creating groups:', error);
    }
  };

  const handleGroupRandomizer = () => {
    setIsRandomizeModalOpen(true); // Open the modal to input group size
  };

  const handleEditGroups = () => {
    setEditableGroups(groups);
    setIsEditGroupsModalOpen(true); // Open the modal to edit groups
  };

  const handleRemoveGroups = () => {
    setIsRemoveGroupsModalOpen(true); // Open the modal to confirm group removal
  };

  const confirmRemoveGroups = async () => {
    try {
      const response = await fetch(`/api/groups/removeGroups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseID: courseId }),
      });

      if (response.ok) {
        toast.success('Groups removed successfully');
        setGroups([]);
        setIsRemoveGroupsModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error('Failed to remove groups', errorData);
        toast.error(errorData.error);
      }
    } catch (error) {
      console.error('Error removing groups:', error);
    }
  };

  const handleMemberClick = (student: Student, groupID: number) => {
    if (selectedStudents.length === 0) {
      setSelectedStudents([{ student, groupID }]);
    } else if (selectedStudents.length === 1) {
      const [firstSelection] = selectedStudents;
      if (firstSelection.student.studentID === student.studentID) {
        // Same student clicked, clear the selection
        setSelectedStudents([]);
      } else {
        // Swap the groups of the two selected students if they are in different groups
        if (firstSelection.groupID !== groupID) {
          swapStudentGroups(firstSelection.student, student, firstSelection.groupID, groupID);
        }
      }
    }
  };

  const handleEmptyGroupClick = (groupID: number) => {
    if (selectedStudents.length === 1) {
      const [firstSelection] = selectedStudents;
      // Move the student to the new group and remove from the old group
      if (firstSelection.groupID !== groupID) {
        moveStudentToGroup(firstSelection.student, firstSelection.groupID, groupID);
      }
    }
  };

  const swapStudentGroups = (student1: Student, student2: Student, group1ID: number, group2ID: number) => {
    setEditableGroups(prevGroups => {
      const newGroups = prevGroups.map(group => {
        if (group.groupID === group1ID) {
          return {
            ...group,
            members: group.members.map(member =>
              member.studentID === student1.studentID ? student2 : member
            ),
          };
        } else if (group.groupID === group2ID) {
          return {
            ...group,
            members: group.members.map(member =>
              member.studentID === student2.studentID ? student1 : member
            ),
          };
        } else {
          return group;
        }
      });
      return newGroups;
    });

    setSelectedStudents([]);
  };

  const moveStudentToGroup = (student: Student, fromGroupID: number, toGroupID: number) => {
    setEditableGroups(prevGroups => {
      const newGroups = prevGroups.map(group => {
        if (group.groupID === fromGroupID) {
          return {
            ...group,
            members: group.members.filter(member => member.studentID !== student.studentID),
          };
        } else if (group.groupID === toGroupID) {
          return {
            ...group,
            members: [...group.members, student],
          };
        } else {
          return group;
        }
      });
      return newGroups;
    });

    setSelectedStudents([]);
  };

  const handleRandomizeGroupsSubmit = () => {
    fetchRandomizedGroups(groupSize);
  };

  const handleSaveGroups = () => {
    setGroups(editableGroups);
    setIsEditGroupsModalOpen(false);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!session || !session.user || !session.user.userID) {
    console.error('No user found in session');
    return null;
  }

  const isAdmin = session.user.role === 'admin';

  const handleAction = (key: any) => {
    switch (key) {
      case "create":
        handleCreateGroups();
        break;
      case "peer-review":
        handleGroupRandomizer();
        break;
      default:
        console.log("Unknown action:", key);
    }
  };

  const handleHomeClick = async () => {
    router.push("/instructor/dashboard")
  };

  if(loading){
    <div className='w-[100vh=w] h-[100vh] instructor flex justify-center text-center items-center my-auto'>
    <Spinner color='primary' size="lg" />
</div>;
  }
  const handleBackClick= async () =>{
    const { source } = router.query;
    if (source === 'course') {
      router.push(`/instructor/course-dashboard?courseId=${router.query.courseId}`);
    }
  }

  return (
    <>
      {isAdmin ? <AdminNavbar /> : <InstructorNavbar />}
      <div className={`instructor text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Create Groups</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={handleHomeClick}>Home</BreadcrumbItem>
            <BreadcrumbItem onClick={handleBackClick}>{courseName ? courseName : 'Course Dashboard'}</BreadcrumbItem> 
            <BreadcrumbItem>Create Student Groups</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={`flex flex-row items-center justify-center ${styles.assignmentsSection}`}>
            <Card shadow="sm" className="w-[100%] mb-3 border-solid border-1 border-primary" style={{ overflow: 'auto' }}>
              <h2 className="p-2 bg-primary-50 ">All Students</h2>
              <hr />
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
            
            <Card shadow="sm" className="w-[100%] border-solid border-1 border-primary" style={{ maxHeight: '80%', overflow: 'auto', minHeight: groups.length > 0 ? '60%' : '10%' }}>
              <h2 className="p-2 bg-primary-50 ">Groups</h2>
              <Accordion variant="bordered">
                {groups.map((group, index) => (
                  <AccordionItem
                    key={index}
                    aria-label={group.groupName}
                    title={group.groupName}
                  >
                    {group.members.map((member, i) => (
                      <div key={i} style={{ margin: '5px' }}>
                        {member.firstName} {member.lastName}
                      </div>
                    ))}
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </div>
          <div className={styles.notificationsSection}>
            <Button color="primary" className="m-1" variant="ghost" onClick={handleCreateGroups}>Create/Update Groups</Button>
            <Button color="primary" className="m-1" variant="ghost" onClick={handleGroupRandomizer}>Create Random Groups</Button>
            <Button color="primary" className="m-1" variant="ghost" onClick={handleEditGroups}>Edit groups</Button>
            <Button color="danger" className="m-1" variant="ghost" onClick={handleRemoveGroups}>Remove groups</Button>
            
          </div>
        </div>

        {/* Randomize Groups Modal */}
        <Modal
          className='z-20'
          backdrop="blur"
          isOpen={isRandomizeModalOpen}
          onOpenChange={(open) => setIsRandomizeModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader>Randomize Groups</ModalHeader>
            <ModalBody>
              <Input
                type="number"
                label="Group Size"
                value={groupSize.toString()}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                min={1}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsRandomizeModalOpen(false)}>
                Close
              </Button>
              <Button color="primary" onPress={handleRandomizeGroupsSubmit}>
                Randomize
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Groups Modal */}
        <Modal
          className='instructor z-20'
          backdrop="blur"
          isOpen={isEditGroupsModalOpen}
          onOpenChange={(open) => setIsEditGroupsModalOpen(open)}
        >
          <ModalContent className="overflow-auto ">
            <ModalHeader><h2>Edit Groups</h2></ModalHeader>
            
            <ModalBody>
              {editableGroups.map((group, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                  <h3>{group.groupName}</h3>
                  {group.members.map((member, i) => (
                    <Button
                      key={i}
                      onPress={() => handleMemberClick(member, group.groupID)}
                      style={{
                        margin: '5px',
                        backgroundColor: selectedStudents.find(s => s.student.studentID === member.studentID) ? 'lightblue' : undefined
                      }}
                    >
                      {member.firstName} {member.lastName}
                    </Button>
                  ))}
                  <Button
                    onPress={() => handleEmptyGroupClick(group.groupID)}
                   className="mx-3 text-white" color="success" variant="solid"
                  >
                    Move Here
                  </Button>
                </div>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={() => setIsEditGroupsModalOpen(false)}>
                Close
              </Button>
              <Button color="primary" onPress={handleSaveGroups}>
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Remove Groups Modal */}
        <Modal
          className='z-20 instructor'
          backdrop="blur"
          isOpen={isRemoveGroupsModalOpen}
          onOpenChange={(open) => setIsRemoveGroupsModalOpen(open)}
        >
          <ModalContent>
            <ModalHeader><h2>Remove Groups</h2></ModalHeader>
            <ModalBody>
              <p className="text-left">Are you sure you want to remove all groups? Once confirmed, the existing groups will be permanently deleted.</p>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" variant="light" onPress={() => setIsRemoveGroupsModalOpen(false)}>
                Cancel
              </Button>
              <Button color="danger" onPress={confirmRemoveGroups}>
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
