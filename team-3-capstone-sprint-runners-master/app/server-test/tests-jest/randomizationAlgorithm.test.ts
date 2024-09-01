// tests-jest/randomizationAlgorithm.test.ts

import { randomizePeerReviewGroups } from '../../src/pages/api/addNew/randomizationAlgorithm';

describe('randomizePeerReviewGroups', () => {
  const students = [
    { studentID: 1 },
    { studentID: 2 },
    { studentID: 3 },
    { studentID: 4 },
    { studentID: 5 },
  ];

  it('should return the correct structure of review groups', () => {
    const reviewsPerAssignment = 2;

    const result = randomizePeerReviewGroups(students, reviewsPerAssignment);

    // Verify the structure
    result.forEach(group => {
      expect(group).toHaveProperty('revieweeID');
      expect(group).toHaveProperty('reviewers');
      expect(Array.isArray(group.reviewers)).toBe(true);
    });
  });

  it('should ensure no student reviews their own submission', () => {
    const reviewsPerAssignment = 2;

    const result = randomizePeerReviewGroups(students, reviewsPerAssignment);

    // Check that no student reviews their own submission
    result.forEach(group => {
      group.reviewers.forEach(reviewerID => {
        expect(reviewerID).not.toBe(group.revieweeID);
      });
    });
  });

  it('should ensure each student has exactly the specified number of reviews', () => {
    const reviewsPerAssignment = 2;

    const result = randomizePeerReviewGroups(students, reviewsPerAssignment);
    const reviewCounts: { [key: number]: number } = {};

    // Count the number of reviews each student has
    result.forEach(group => {
      group.reviewers.forEach(reviewerID => {
        reviewCounts[reviewerID] = (reviewCounts[reviewerID] || 0) + 1;
      });
    });

    console.log('Review Counts:', reviewCounts); // Add this line to debug
    console.log(result);

    // Verify each student has exactly the specified number of reviews
    students.forEach(student => {
      expect(reviewCounts[student.studentID]).toBe(reviewsPerAssignment);
    });
  });

  it('should ensure no submission has more reviewers than the specified number of reviews per assignment', () => {
    const reviewsPerAssignment = 2;

    const result = randomizePeerReviewGroups(students, reviewsPerAssignment);

    // Verify no submission has more reviewers than the specified limit
    result.forEach(group => {
      expect(group.reviewers.length).toBeLessThanOrEqual(reviewsPerAssignment);
    });
  });

  it('should handle cases where there are more students than reviews required', () => {
    const reviewsPerAssignment = 1;

    const result = randomizePeerReviewGroups(students, reviewsPerAssignment);

    // Verify each student has exactly one review
    const reviewCounts: { [key: number]: number } = {};
    result.forEach(group => {
      group.reviewers.forEach(reviewerID => {
        reviewCounts[reviewerID] = (reviewCounts[reviewerID] || 0) + 1;
      });
    });

    students.forEach(student => {
      expect(reviewCounts[student.studentID]).toBe(reviewsPerAssignment);
    });
  });

  it('should throw an error for invalid inputs', () => {
    expect(() => randomizePeerReviewGroups([], 2)).toThrow('Invalid input');
    expect(() => randomizePeerReviewGroups(students, 0)).toThrow('Invalid input');
    expect(() => randomizePeerReviewGroups(students, -1)).toThrow('Invalid input');
    expect(() => randomizePeerReviewGroups(students, students.length + 1)).toThrow('Invalid input');
  });
});
