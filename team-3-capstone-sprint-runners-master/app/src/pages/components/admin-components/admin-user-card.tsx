import type { NextPage } from 'next';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import React from 'react';


const ViewUserCard: NextPage = () => {
const router = useRouter();
const [isPopoverOpen, setIsPopoverOpen] = useState(false); //to close popup when modal opens
const [isModalOpen, setIsModalOpen] = useState(false);
const openDeleteModal = () => {
    setIsPopoverOpen(false);
    setIsModalOpen(true);
};

return (
    <div className='instructor'>
        <Card className=' m-1 mx-5 max-h-[20vh]'>

            <CardBody className='flex-row justify-center align-center text-left'>
                <div className='float-left'>
                    <h3 className='mb-1'>User Name</h3>
                    <i className=''> Email</i>
                    <p>Role</p>
                </div>

                <div className='ml-auto my-auto'>
                    {/* <Button className='mx-2' variant='ghost' color='success' size='sm'>Approve</Button>
            <Button variant='ghost' color='danger' size='sm'>Deny</Button> */}

                    <Popover
                        placement="right-end"
                        showArrow={true}
                        isOpen={isPopoverOpen}
                        onOpenChange={(open) => setIsPopoverOpen(open)}
                    >
                        <PopoverTrigger>
                            <img className="ml-auto w-[35%]" alt="More" src="/Images/More.png" />
                        </PopoverTrigger>
                        <PopoverContent className='z-10'>
                            <Button className='w-[100%]' variant='light'>Change Role </Button>
                            <Button className='w-[100%]' variant='light' onClick={openDeleteModal}>Delete User</Button>
                        </PopoverContent>
                    </Popover>
                    <Modal
                        className='z-20'
                        backdrop="blur"
                        isOpen={isModalOpen}
                        onOpenChange={(open) => setIsModalOpen(open)}
                    >
                        <ModalContent>
                            <ModalHeader>Delete Course</ModalHeader>
                            <ModalBody>
                                <p>Once you confirm delete, the change will be made permanent. Confirm below to continue.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="primary" variant="light" onPress={() => setIsModalOpen(false)}>
                                    Close
                                </Button>
                                <Button color="danger" onPress={() => setIsModalOpen(false)}>
                                    Delete
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>

            </CardBody>
        </Card>
    </div>
);
};

export default ViewUserCard