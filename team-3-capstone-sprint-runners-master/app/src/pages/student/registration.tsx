// Student Registration
// src/pages/student/registration.tsx
/* eslint-disable @next/next/no-img-element */
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/student-register.module.css';
import { Button, Divider, Input, ScrollShadow } from '@nextui-org/react';
import toast from 'react-hot-toast';

const SignUp: NextPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [studentID, setStudentID] = useState('');
  const router = useRouter();
  const [errors, setErrors] = useState({ firstName: '', lastName: '', studentID: '', email: '', password: '' });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const validateEmail = (email: string) => {
    // Regex for validating email
    const regex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    return regex.test(email);
  };
  const validatePassword = (password: string) => {
    // Regex for validating password: minimum 8 characters, one capital, one lowercase, one number, and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  const handleSignUpClick = async () => {
    let firstNameError = '';
    let lastNameError = '';
    let studentIDError = '';
    let emailError = '';
    let passwordError = '';

    if (firstName === '') {
      firstNameError = 'First name cannot be empty';
    }

    if (lastName === '') {
      lastNameError = 'Last name cannot be empty';
    }

    if (studentID === '') {
      studentIDError = 'Student ID cannot be empty';
    }

    if (!validateEmail(email)) {
      emailError = 'Invalid email';
    }

    if (!validatePassword(password)) {
      passwordError = 'Password must be minimum 8 characters, include one capital, one lowercase, and one special character';
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      passwordError = 'Password and confirm password do not match';
    }

    setErrors({ firstName: firstNameError, lastName: lastNameError, studentID: studentIDError, email: emailError, password: passwordError });


    if (firstNameError || lastNameError || studentIDError || emailError || passwordError) {
      toast.error('There was an error with sign up. Please try again.')
    } else {
      try {
        const response = await fetch('/api/addNew/addStudent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ firstName, lastName, email, password, role: 'student', studentID })
        });

        if (response.ok) {
          // Send email
          await fetch('/api/emails/sendEmailConfirmation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, email })
          });
        console.log(email)
          router.push('/student/login');
          toast.success("Account created! Please sign in to continue.")
        } else {
          const errorData = await response.json();
          toast.error(errorData.error);
        }
        
      } catch (error) {
        toast.error('Failed to sign up');
      }
    }
  };

const handleBackClick = () => {
  // Redirect user to landing page
  router.push('/');
};
  const handleLoginClick = () => {
    // Redirect user to login page
    router.push('/student/login');
  }

  return (
    <div className="student flex justify-center w-[100vw] h-[100vh] items-center bg-gradient-to-r from-[#459992] to-[#bbb9b9] text-black">
      <div className="flex-col justify-evenly text-center bg-white min-w-fit p-[2vw] flex border-solid border-2 border-primary">
        <div className="justify-self-center p-4 bg-[#c0dfdc] text-primary flex text-center items-center">
          <img src="/images/Student/Back-Student.png" alt="Back" className="absolute object-cover cursor-pointer w-[2vw] h-[2vw]" onClick={handleBackClick} aria-label='Back to Landing Page'/>
          <h2 className='text-center mx-auto' >Create Account</h2>
          </div>
        <br />
        <hr />
        <div className='max-h-[45vh] p-2 overflow-y-auto'>
          <p className='my-2 text-small'>Enter the following information to create your account:</p>
          <div className='flex'>
            <Input size='sm' className="my-1 p-2 w-1/2 border-primary-900" type="text" labelPlacement="inside" label="First Name" value={firstName}
              onChange={(e) => setFirstName(e.target.value)} />
            <Input size='sm' className="my-1 p-2 w-1/2" type="text" labelPlacement="inside" label="Last Name" value={lastName}
              onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className='flex justify-between mx-2'>
            <p className='text-danger-300 font-bold'>{errors.firstName}</p>
            <p className='text-danger-300 font-bold'>{errors.lastName}</p>
          </div>
          <div className='flex'>
            <Input size='sm' className="my-1 p-2" type="text" labelPlacement="inside" label="Student ID" value={studentID}
              onChange={(e) => setStudentID(e.target.value)} />
            <Input size='sm' className="my-1 p-2" type="email" labelPlacement="inside" label="Email" value={email}
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className='flex justify-between mx-2'>
            <p className='text-danger-300 font-bold'>{errors.studentID}</p>
            <p className='text-danger-300 font-bold'>{errors.email}</p>
          </div>
          <div className='flex'>
            <Input size='sm' className="my-1 p-2" type="password" labelPlacement="inside" label="Password" value={password}
              onChange={(e) => setPassword(e.target.value)}  onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(false)}/>
            <Input size='sm' className="my-1 p-2" type="password" labelPlacement="inside" label="Confirm Password" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <p className='text-danger-300 font-bold my-2'>{errors.password}</p>
          {showPasswordRequirements && (
  <div className='text-xs text-left text-danger-700 mt-0 ml-2'>
    <p>Password must contain the following:</p>
    <ul className='text-xs list-decimal px-6'>
      <li>Minimum 8 characters</li>
      <li>One uppercase</li>
      <li>One lowercase</li>
      <li>A special character</li>
      <li>A number</li>
    </ul>
  </div>
)}
          <Button color='primary' className='w-full mt-2' variant="solid" onClick={handleSignUpClick}>
            Sign Up
          </Button>
        </div>

        <Divider className='my-4 bg-secondary' />

        <div className="flex-row align-center justify-center text-center">
          <p className="text-center p-1">Already have an account?
            <Button color='primary' className="w-fit h-5 m-1" variant="flat" onClick={handleLoginClick}>
              Sign In
            </Button></p>
        </div>
      </div>
    </div>

  );
};

export default SignUp;