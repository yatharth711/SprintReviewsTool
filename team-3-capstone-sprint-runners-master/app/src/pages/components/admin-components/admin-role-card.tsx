import type { NextPage } from 'next';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Button, Card, CardBody, CardFooter, CardHeader, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
import React from 'react';


const RoleRequestCard: NextPage = () =>{
    return (
        <div className='instructor'>
          <Card className=' m-1 mx-5 max-h-[20vh]'>
           
            <CardBody className='flex-row justify-center align-center text-left'>
                <div >
                <h3 className='mb-1'>User Name</h3> 
                <p>This user is requesting x role from admin.</p>
                </div>
                <div className='ml-auto m-2 align-center text-center'>
                <Button className='mx-2' variant='ghost' color='success' size='sm'>Approve</Button>
                <Button variant='ghost' color='danger' size='sm'>Deny</Button>
                </div>   
                
            </CardBody>
          </Card>
        </div>
      );
    };

export default RoleRequestCard