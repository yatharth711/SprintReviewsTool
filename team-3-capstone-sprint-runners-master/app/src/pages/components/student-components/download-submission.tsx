import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@nextui-org/react';

interface DownloadSubmissionProps {
  studentID: number;
  assignmentID: number;
}

const DownloadSubmission: React.FC<DownloadSubmissionProps> = ({ studentID, assignmentID }) => {
  const [link, setLink] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ uri: string; fileType: string; fileName: string } | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmission = async () => {
    if (isViewerOpen) {
      // Close the viewer if it's already open
      setLink(null);
      setFileData(null);
      setIsViewerOpen(false);
      return;
    }

    try {
      const response = await axios.get(`/api/review-dashboard/downloadSubmission?assignmentID=${assignmentID}&studentID=${studentID}`, {
        responseType: 'json'
      });

      const data = response.data;

      if (typeof data.link === 'string') {
        // It's a link
        setLink(data.link);
      } else {
        // It's a file
        const fileResponse = await axios.get(`/api/review-dashboard/downloadSubmission?assignmentID=${assignmentID}&studentID=${studentID}`, {
          responseType: 'blob'
        });

        const contentType = fileResponse.headers['content-type'];
        const blob = new Blob([fileResponse.data], { type: contentType });
        const uri = URL.createObjectURL(blob);
        setFileData({ uri, fileType: contentType, fileName: data.fileName });
      }

      // Open the viewer
      setIsViewerOpen(true);
      setError(null); // Reset error state
    } catch (error) {
      console.error('Error handling the submission', error);
      setError('Failed to fetch the document. Please try again.');
    }
  };

  const handleDownload = () => {
    if (fileData) {
      const link = document.createElement('a');
      link.href = fileData.uri;
      link.download = fileData.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const ensureAbsoluteUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `http://${url}`;
    }
    return url;
  };

  return (
    <div>
      <div className="flex items-center">
        <Button onClick={handleSubmission} variant='light' color={isViewerOpen ? "danger" : 'success'}>
          {isViewerOpen ? 'Close Viewer' : 'View Submission'}
        </Button>
        {isViewerOpen && fileData && (
          <Button onClick={handleDownload} variant='flat' className="ml-2">
            Download
          </Button>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isViewerOpen && (
        <>
          {link && (
            <div>
              <p>Submission Link:</p>
              <a href={ensureAbsoluteUrl(link)} target="_blank" rel="noopener noreferrer">{link}</a>
            </div>
          )}
          {fileData && (
            <div>
              {fileData.fileType === 'application/pdf' && (
                <iframe src={fileData.uri} width="100%" height="600px"></iframe>
              )}
              {fileData.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && (
                <div className='flex items-center'>
                  <p className='mr-5'>Click the button below to download and view submission:</p>
                  <Button onClick={handleDownload} variant='flat'>Download</Button>
                </div>
              )}
              {fileData.fileType === 'text/plain' && (
                <iframe src={fileData.uri} width="100%" height="600px"></iframe>
              )}
              {(fileData.fileType === 'application/zip' || fileData.fileType === 'application/x-zip-compressed') && (
                <div>
                  <p>Zip file uploaded. Click the button below to download:</p>
                  <Button onClick={handleDownload} color="primary" variant='solid'>Download</Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DownloadSubmission;
