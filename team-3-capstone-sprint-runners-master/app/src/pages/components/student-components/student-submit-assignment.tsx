import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input } from "@nextui-org/react";
import { useSessionValidation } from '@/pages/api/auth/checkSession';
import router from 'next/router';

interface SubmitAssignmentProps {
  assignmentID: number;
  userID: number;
}

const SubmitAssignment: React.FC<SubmitAssignmentProps> = ({ assignmentID, userID }) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useSessionValidation('student', setLoading, setSession);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await fetch(`/api/getStudentByID?userID=${userID}`);
        if (response.ok) {
          const data = await response.json();
          setStudentInfo(data.student);
        } else {
          throw new Error('Failed to fetch student information');
        }
      } catch (error) {
        console.error('Error fetching student information:', error);
        setMessage('Error fetching student information');
      }
    };

    fetchStudentInfo();
  }, [userID]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setIsSuccess(false); // Reset success state when a new file is selected
    }
  };

  const handleSubmit = async () => {
    if (!file || !studentInfo) {
      setMessage('Please select a file to upload and ensure student information is loaded');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignmentID', assignmentID.toString());
    formData.append('studentID', studentInfo.studentID.toString());

    try {
      const response = await fetch('/api/submitAssignment', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Assignment submitted successfully');
        setIsSuccess(true);
        setFile(null);
      } else {
        throw new Error(result.message || 'Failed to submit assignment');
      }
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button onPress={onOpen}>Submit Assignment</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Submit Assignment</ModalHeader>
              <ModalBody>
                {!isSuccess ? (
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    disabled={submitting}
                    // helperText={file ? `Selected file: ${file.name}` : 'No file selected'}
                  />
                ) : (
                  <p style={{ color: 'green' }}>Assignment submitted successfully!</p>
                )}
                {message && !isSuccess && <p style={{ color: 'red' }}>{message}</p>}
              </ModalBody>
              <ModalFooter>
                <Button color="warning" variant="light" onPress={onClose}>
                  Close
                </Button>
                {!isSuccess && (
                  <Button 
                    color="primary" 
                    onPress={handleSubmit}
                    disabled={submitting || !file || !studentInfo}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SubmitAssignment;