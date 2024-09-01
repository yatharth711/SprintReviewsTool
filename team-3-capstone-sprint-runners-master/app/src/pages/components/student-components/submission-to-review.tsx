import React from 'react';

interface Submission {
  submissionID: number;
  fileName: string;
  fileContent: string;
  fileType: string;
}

interface SubmissionToReviewProps {
  submission: Submission | null;
}

const SubmissionToReview: React.FC<SubmissionToReviewProps> = ({ submission }) => {
  if (!submission) {
    return <div>No submission to review.</div>;
  }

  return (
    <div>
      <h3>Submission to Review</h3>
      <p>File Name: {submission.fileName}</p>
      <p>File Type: {submission.fileType}</p>
      {submission.fileType.startsWith('image/') ? (
        <img src={`data:${submission.fileType};base64,${submission.fileContent}`} alt="Submitted file" />
      ) : (
        <pre>{submission.fileContent}</pre>
      )}
    </div>
  );
};

export default SubmissionToReview;