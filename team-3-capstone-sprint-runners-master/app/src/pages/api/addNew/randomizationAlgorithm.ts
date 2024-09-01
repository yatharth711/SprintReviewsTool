type ReviewGroup = {
  revieweeID: number;
  reviewers: number[];
};

type Student = {
  studentID: number;
};

// Function to randomize peer review groups
export const randomizePeerReviewGroups = (students: Student[], reviewsPerAssignment: number): ReviewGroup[] => {
  // Check for invalid input
  if (students.length === 0 || reviewsPerAssignment <= 0 || reviewsPerAssignment > students.length) {
    throw new Error('Invalid input');
  }

  // Helper function to shuffle an array (Fisher-Yates shuffle algorithm)
  const shuffleArray = (array: any[]): void => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  // Initialize review groups and a count of reviews each student has given
  const reviewGroups: { [key: number]: number[] } = {};
  const studentReviewsCount: { [key: number]: number } = {};

  // Set up initial empty arrays and counts for each student
  students.forEach((student) => {
    reviewGroups[student.studentID] = [];
    studentReviewsCount[student.studentID] = 0;
  });

  // Iterate over each student to assign reviewers
  for (const reviewee of students) {
    const studentID = reviewee.studentID;

    // Get a list of possible reviewers (excluding the reviewee themselves)
    const possibleReviewers = students
      .filter((reviewer) => reviewer.studentID !== studentID)
      .map((reviewer) => reviewer.studentID);

    // Shuffle the possible reviewers list to ensure randomness
    shuffleArray(possibleReviewers);

    // Assign reviewers until the required number of reviews is reached
    while (reviewGroups[studentID].length < reviewsPerAssignment && possibleReviewers.length > 0) {
      const reviewerID = possibleReviewers.pop()!;
      if (studentReviewsCount[reviewerID] < reviewsPerAssignment) {
        reviewGroups[studentID].push(reviewerID);
        studentReviewsCount[reviewerID]++;
      }
    }
  }

  // Convert the review groups object to an array of ReviewGroup objects
  const result: ReviewGroup[] = Object.keys(reviewGroups).map((revieweeID) => ({
    revieweeID: Number(revieweeID),
    reviewers: reviewGroups[Number(revieweeID)],
  }));

  return result;
};
