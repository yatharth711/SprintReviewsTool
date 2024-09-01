import type { NextPage } from 'next';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, Input } from '@nextui-org/react';
import React from 'react';

export type AdminCourseOptionsType = {
  courseName?: string;
  courseID: number;
  isArchived: boolean;
}

export type ConfirmDeleteCourseType = {
  className?: string;
  courseID: number;
}

const AdminCourseOptions: NextPage<AdminCourseOptionsType> = ({ courseName = "", courseID, isArchived }) => {
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false); // To close popup when modal opens
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState(courseName);

  const onArchiveContainerClick = useCallback(async () => {
    try {
      const response = await fetch('/api/courses/archiveCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseID }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle archive status');
      }

      router.reload();
    } catch (error) {
      console.error('Error toggling archive status:', error);
    }
  }, [courseID, router]);

  const openDeleteModal = () => {
    setIsPopoverOpen(false);
    setIsDeleteModalOpen(true);
  };

  const openEditModal = () => {
    setIsPopoverOpen(false);
    setIsEditModalOpen(true);
  };

  const onConfirmDeleteClick = useCallback(async () => {
    try {
      const response = await fetch('/api/courses/deleteCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseID }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete course');
      }

      console.log('Course deleted successfully');
      router.reload();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  }, [courseID, router]);

  const onEditCourseNameClick = useCallback(async () => {
    try {
      const response = await fetch(`/api/updateTable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          table: 'course',
          data: {
            courseID: courseID,
            courseName: newCourseName
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update course name');
      }

      console.log('Course name updated successfully');
      router.reload();
    } catch (error) {
      console.error('Error updating course name:', error);
    }
  }, [courseID, newCourseName, router]);

  return (
    <div className='instructor'>
      <Popover 
        placement="right-end" 
        showArrow={true}
        isOpen={isPopoverOpen}
        onOpenChange={(open) => setIsPopoverOpen(open)}
      >
        <PopoverTrigger>
          <img className="ml-auto w-[7.5%]" alt="More" src="/Images/More.png" />
        </PopoverTrigger>
        <PopoverContent className='z-10'>
          <Button className='w-[100%]' variant='light' onClick={openEditModal}>Edit Course Name</Button>
          <Button className='w-[100%]' variant='light' onClick={onArchiveContainerClick}>
            {isArchived ? 'Unarchive' : 'Archive'} {courseName}
          </Button>
          <Button className='w-[100%]' variant='light' onClick={openDeleteModal}>Delete Course</Button>
        </PopoverContent>
      </Popover>
      <Modal 
        className='z-20' 
        backdrop="blur" 
        isOpen={isDeleteModalOpen} 
        onOpenChange={(open) => setIsDeleteModalOpen(open)}
      >
        <ModalContent>
          <ModalHeader>Delete Course</ModalHeader>
          <ModalBody>
            <p>Once you confirm delete, the change will be made permanent. Confirm below to continue.</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="light" onPress={() => setIsDeleteModalOpen(false)}>
              Close
            </Button>
            <Button color="danger" onPress={onConfirmDeleteClick}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal 
        className='z-20' 
        backdrop="blur" 
        isOpen={isEditModalOpen} 
        onOpenChange={(open) => setIsEditModalOpen(open)}
      >
        <ModalContent>
          <ModalHeader>Edit Course Name</ModalHeader>
          <ModalBody>
            <Input 
              isClearable 
              fullWidth 
              label="Enter new course name" 
              value={newCourseName} 
              onChange={(e) => setNewCourseName(e.target.value)} 
            />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="light" onPress={() => setIsEditModalOpen(false)}>
              Close
            </Button>
            <Button color="primary" onPress={onEditCourseNameClick}>
              Update
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminCourseOptions;
