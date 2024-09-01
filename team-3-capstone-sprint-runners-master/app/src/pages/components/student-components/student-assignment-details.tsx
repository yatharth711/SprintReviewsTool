import React from 'react';
import { Card, CardBody } from "@nextui-org/react";

interface StudentAssignmentViewProps {
    // title: string;
    description: string;
    startDate: string;
    endDate: string;
    deadline: string;
    allowedFileTypes: string;
}

const StudentAssignmentView: React.FC<StudentAssignmentViewProps> = ({ description, startDate, endDate, deadline, allowedFileTypes }) => {
    return (
        <div>
            <Card>
                <CardBody>
                    {/* <h2>{title}</h2> */}
                    <h3>Description:</h3>
                    <p>{description}</p>
                    <br />

                    <div className='flex justify-start items-start'>
                        <div className='mr-16'>
                            <h3>Start Date:</h3>
                            <p>{startDate}</p>
                        </div>
                        <div className='mr-16'>
                            <h3>Due Date:</h3>
                            <p>{deadline}</p>
                        </div>
                        <div className='mr-16'>
                            <h3>End Date:</h3>
                            <p>{endDate}</p>
                        </div>
                    </div>


                    <br />
                    <h3>Upload Restrictions</h3>
                    <p>{allowedFileTypes}</p>
                </CardBody>
            </Card>
        </div>
    );
}

export default StudentAssignmentView;