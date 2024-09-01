import React from 'react';

interface ReviewCriterion {
  criteriaID: number;
  criterion: string;
  maxMarks: number;
}

interface ReviewCriteriaProps {
  criteria: ReviewCriterion[];
}

const ReviewCriteria: React.FC<ReviewCriteriaProps> = ({ criteria }) => {
  return (
    <div>
      <h3>Review Criteria</h3>
      <ul>
        {criteria.map((criterion) => (
          <li key={criterion.criteriaID}>
            {criterion.criterion} (Max marks: {criterion.maxMarks})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewCriteria;