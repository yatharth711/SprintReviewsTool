// // confirm-delete-course.tsx
// /* eslint-disable @next/next/no-img-element */
// import type { NextPage } from 'next';
// import { useCallback } from 'react';
// import { useRouter } from 'next/router';
// import styles from '../../../styles/confirm-delete-course.module.css';

// export type ConfirmDeleteCourseType = {
//   className?: string;
//   courseID: number;
//   onClose: () => void;
// }

// const ConfirmDeleteCourse: NextPage<ConfirmDeleteCourseType> = ({ className = "", courseID, onClose }) => {
//   const router = useRouter();

//   const onInstructorButtonContainerClick = useCallback(async () => {
//     try {
//       const response = await fetch('/api/courses/deleteCourse', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ courseID }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete course');
//       }

//       // Handle successful response
//       console.log('Course deleted successfully');
//       onClose(); // Close the popup after deleting
//       router.reload(); // Reload the page to refresh the state
//     } catch (error) {
//       console.error('Error deleting course:', error);
//     }
//   }, [courseID, onClose, router]);

//   return (
//     <div className={[styles.confirmDeleteCourse, className].join(' ')}>
//       <img className={styles.multiplyIcon} alt="" src="/Images/Close.png" onClick={onClose} />
//       <i className={styles.confirmDelete}>Confirm Delete</i>
//       <b className={styles.onceYouConfirm}>Once you confirm delete, the change will be made permanent. Confirm below to continue.</b>
//       <div className={styles.instructorButton} onClick={onInstructorButtonContainerClick}>
//         <div className={styles.instructorButtonChild} />
//         <b className={styles.createAssignment}>Delete</b>
//       </div>
//     </div>
//   );
// };

// export default ConfirmDeleteCourse;
