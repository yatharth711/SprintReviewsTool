import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSessionValidation } from '../api/auth/checkSession';
import StudentNavbar from "../components/student-components/student-navbar";
import { Avatar, BreadcrumbItem, Breadcrumbs, Button, Card, CardBody, CardHeader, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@nextui-org/react";
import styles from '../../styles/instructor-course-dashboard.module.css';
import toast from 'react-hot-toast';

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedDetails, setEditedDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    homeAddress: '',
    dateOfBirth: ''
  });

  const router = useRouter();

  // Use the session validation hook to check if the user is logged in
  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    if (session?.user?.userID) {
      fetch(`/api/userInfo/student-user-details?userID=${session.user.userID}`)
        .then(response => response.json())
        .then(data => {
          setUserDetails(data);
          setEditedDetails({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber || '',
            homeAddress: data.homeAddress || '',
            dateOfBirth: data.dateOfBirth || ''
          });
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user details:', error);
          setLoading(false);
        });
    }
  }, [session]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDetails({
      ...editedDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveChanges = async () => {
    try {
      // Update user table
      const userResponse = await fetch('/api/updateTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'user',
          data: {
            userID: session.user.userID,
            fname: editedDetails.firstName,
            lname: editedDetails.lastName,
            email: editedDetails.email,
          }
        }),
      });

      // Update student table
      const studentResponse = await fetch('/api/updateTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          table: 'student',
          data: {
            studentID: userDetails.studentID,
            userID: session.user.userID,
            phoneNumber: editedDetails.phoneNumber,
            address: editedDetails.homeAddress,
            dob: editedDetails.dateOfBirth,
          }
        }),
      });

      if (userResponse.ok && studentResponse.ok) {
        // Update was successful
        setUserDetails({
          ...userDetails,
          firstName: editedDetails.firstName,
          lastName: editedDetails.lastName,
          email: editedDetails.email,
          phoneNumber: editedDetails.phoneNumber,
          homeAddress: editedDetails.homeAddress,
          dateOfBirth: editedDetails.dateOfBirth
        });
        setIsEditModalOpen(false);
      } else {
        console.error('Failed to update user details');
        toast.error("Error, missing items in the field ");
        
      }
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  if (loading) {
    return (
      <div className='w-[100vh=w] h-[100vh] student flex justify-center text-center items-center my-auto'>
        <Spinner color='primary' size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className={`student text-primary-900 ${styles.container}`}>
        <div className={styles.header}>
          <h1>Profile</h1>
          <br />
          <Breadcrumbs>
            <BreadcrumbItem onClick={() => router.push("/student/dashboard")}>Home</BreadcrumbItem>
            <BreadcrumbItem>Profile</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className={styles.mainContent}>
          <div className={`flex-col bg-white p-[1%] w-[86%] m-[.8%] ml-auto h-[100%]`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardBody className="text-sm font-medium">User Profile</CardBody>
              </CardHeader>
              <CardBody className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <Avatar src="/placeholder-user.jpg" />
                </Avatar>
                {userDetails && (
                  <>
                    <div className="text-2xl font-bold">{`${userDetails.firstName} ${userDetails.lastName}`}</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails.email}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone: {userDetails.phoneNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address: {userDetails.homeAddress}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth: {userDetails.dateOfBirth}</p>
                  </>
                )}
              </CardBody>
            </Card> 
            <Button color="primary" variant="ghost" className="w-[100%] m-1" onClick={handleEditClick}>Edit Profile</Button>
          </div>
          
        </div>
      </div>

      <Modal
        backdrop="blur"
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
      >
        <ModalContent>
          <ModalHeader>Edit Profile</ModalHeader>
          <ModalBody>
            <Input
              label="First Name"
              name="firstName"
              value={editedDetails.firstName}
              onChange={handleInputChange}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={editedDetails.lastName}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              value={editedDetails.email}
              onChange={handleInputChange}
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={editedDetails.phoneNumber}
              onChange={handleInputChange}
            />
            <Input
              label="Home Address"
              name="homeAddress"
              value={editedDetails.homeAddress}
              onChange={handleInputChange}
            />
            <Input
              label="Date of Birth"
              name="dateOfBirth"
              value={editedDetails.dateOfBirth}
              onChange={handleInputChange}
              type="date"
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={handleSaveChanges}>Save Changes</Button>
            <Button color="danger" variant="light" onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <StudentNavbar profile={{ className: "bg-secondary-200" }} />
    </>
  );
}