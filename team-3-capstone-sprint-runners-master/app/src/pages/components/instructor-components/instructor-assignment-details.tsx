import React from 'react';
import { Accordion, AccordionItem, Card, CardBody, Listbox, ListboxItem } from "@nextui-org/react";
import { useRouter } from 'next/router';
import styles from "../../../styles/AssignmentDetailCard.module.css";

interface AssignmentDetailCardProps {
  assignmentID: number;
  title: string;
  description: string;
  deadline: string;
  isGroupAssignment: boolean;
  submittedEntities: { studentID: number; name: string; fileName: string }[] | { groupID: number; groupName: string; members: { studentID: number; name: string; fileName: string }[] }[];
  remainingEntities: { studentID: number; name: string }[] | { groupID: number; groupName: string; members: { studentID: number; name: string }[] }[];
}

const AssignmentDetailCard: React.FC<AssignmentDetailCardProps> = ({
  assignmentID,
  title,
  description,
  deadline,
  isGroupAssignment,
  submittedEntities = [],
  remainingEntities = [],
}) => {
  const router = useRouter();

  const handleNavigation = (id: number, isGroup: boolean) => {
    const page = isGroup ? 'group-submission-feedback' : 'submission-feedback';
    router.push(`/instructor/${page}/?assignmentID=${assignmentID}&studentID=${id}`);
  };

  return (
    <div className={styles.courseCards}>
      <Card className={styles.assignmentCard}>
        <CardBody>
          <h2 className={styles.assignmentTitle}>{title}</h2>
          <p className={styles.assignmentDescription}>{description}</p>
          <p className={styles.assignmentDeadline}>Deadline: {deadline}</p>
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-success">
            {isGroupAssignment ? "Submitted Groups" : "Submitted Students"}
            <hr className='mt-2'/>
          </h3>
          {isGroupAssignment ? (
            <Accordion >
              {(submittedEntities as { groupID: number; groupName: string; members: { studentID: number; name: string; fileName: string }[] }[]).map((group) => (
                <AccordionItem key={group.groupID} title={group.groupName}>
                  <Listbox variant='bordered' color='success'>
                    {group.members.map((member) => (
                      <ListboxItem key={member.studentID} onClick={() => handleNavigation(member.studentID, true)}>
                        {member.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Listbox variant='bordered' color='success'>
              {(submittedEntities as { studentID: number; name: string; fileName: string }[]).map((student) => (
                <ListboxItem key={student.studentID} onClick={() => handleNavigation(student.studentID, false)}>
                  {student.name}
                </ListboxItem>
              ))}
            </Listbox>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-danger-700">
            {isGroupAssignment ? "Remaining Groups" : "Remaining Students"}
            <hr className='mt-2'/>
          </h3>
          {isGroupAssignment ? (
            <Accordion>
              {(remainingEntities as { groupID: number; groupName: string; members: { studentID: number; name: string }[] }[]).map((group) => (
                <AccordionItem key={group.groupID} title={group.groupName}>
                  <Listbox variant='bordered' color='danger'>
                    {group.members.map((member) => (
                      <ListboxItem key={member.studentID} onClick={() => handleNavigation(member.studentID, true)}>
                        {member.name}
                      </ListboxItem>
                    ))}
                  </Listbox>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Listbox variant='bordered' color='danger'>
              {(remainingEntities as { studentID: number; name: string }[]).map((student) => (
                <ListboxItem key={student.studentID} onClick={() => handleNavigation(student.studentID, false)}>
                  {student.name}
                </ListboxItem>
              ))}
            </Listbox>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailCard;
