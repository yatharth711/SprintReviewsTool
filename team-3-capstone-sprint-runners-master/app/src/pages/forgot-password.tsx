import { useState } from 'react';
import { Button, Input, Tooltip } from '@nextui-org/react';
import styles from '../styles/landing.module.css';
import Image from 'next/image';
import toast from 'react-hot-toast';
import router from 'next/router';

interface User {
  globalID: number;
  userID: number;
  email: string;
  userRole: string;
}

export default function Page() {
  const [email, setEmail] = useState('');
  const [id, setId] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const validatePassword = (password: string) => {
    // Regex for validating password: minimum 8 characters, one capital, one lowercase, and one special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  const checkEmailAndId = async () => {
    try {
      const response = await fetch('/api/forgotPassword/checkEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, globalID: id }), // Include globalID in the request body
      });

      const data = await response.json();
      setMessage(data.message);
      // toast.error(data.message);
      if (response.status === 200) {
        setUser(data.user);
        // if (id && data.user.globalID !== id) {
        //   setMessage('ID does not match.');
        // }
        toast.success('Valid email and ID')
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error checking email');
      // toast.error('Invalid email or ID')
    }
  };

  const updatePassword = async () => {
    if(!validatePassword(password)){
      setMessage('Password must be minimum 8 characters, include one capital, one lowercase, and one special character')
      toast.error('Invalid password.')
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      toast.error('Your passwords do not match.')
      return;
    }
    try {
      const response = await fetch('/api/forgotPassword/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await response.json();
      setMessage(data.message);
      if (response.status === 200) {
        toast.success("Your password has been reset successfully");
        toast.success("Please wait to be redirected to login.");
        if(user?.userRole ==='student'){
          setTimeout(()=> {
          router.push('/student/login'); 
        },3000)
        }else{
          setTimeout(()=> {
            router.push('/instructor/login');
        },3000)
        
      }
    }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error updating password');
    }
  };
  const handleBackClick = async () => {
    // Redirect to the landing page
    router.back();
  };
  return (
    <div style={{ background: 'linear-gradient(to right, #265652, #404982)', minHeight: '100vh', minWidth: '100vw', padding: '5vh', overflowX: 'hidden', overflowY: 'hidden', margin: 'auto' }}>
      <div className='bg-white max-w-[44vw] p-[3vw] mx-auto my-auto justify-center text-center shadow-lg shadow-blue-950 border-3 border-blue-900 rounded-[10px] overflow-hidden flex-col'>
        <div className="justify-self-center p-4 pl-2 text-primary flex text-center items-center mb-3">

          <img className="m-0 mr-2 object-cover cursor-pointer w-[2vw] h-[2vw]" alt="Back" src="/images/student/Back-Student.png" onClick={handleBackClick} aria-label='Back to Landing Page' />

          <h2 className="student text-center text-primary-700 mx-auto">Forgot Password</h2>
        </div>

        <p>Please enter your email and ID to continue: </p>
        <div className='flex items-center m-0 p-0'>
          <Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} label="Email" autoComplete='off' size='sm' className="my-1 p-2 w-2/3 border-primary-900" />



          <Tooltip content='Enter your student ID or instructor ID' placement='bottom'><Input type='number' value={id ? id.toString() : ''} onChange={(e) => setId(Number(e.target.value))} label="ID" autoComplete='off' size='sm' className="my-1 p-2 w-1/3 border-primary-900" />
          </Tooltip>
          <Button onClick={checkEmailAndId} variant='solid' size='sm' className='student bg-success-900 text-white'>Continue</Button>
        </div>


        {user && (
          <>
            <div className='flex items-center m-0 p-0'>
              <Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} size='sm' label="Password" autoComplete='off' className="my-1 p-2 w-1/2 border-primary-900"  onFocus={() => setShowPasswordRequirements(true)}
  onBlur={() => setShowPasswordRequirements(false)}/>
              <Input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} size='sm' label="Confirm Password" autoComplete='off' className="my-1 p-2 w-1/2 border-primary-900" />

            </div>
            {showPasswordRequirements && (
  <div className='text-xs text-left text-danger-600 mt-2 ml-2'>
  <p>Password must contain the following:</p>
  <ul className='text-xs list-decimal px-6'>
    <li>Minimum 8 characters</li>
    <li>One uppercase</li>
    <li>One lowercase</li>
    <li>A special character</li>
    <li>A number</li>
  </ul>
</div>
)}<Button variant='solid' onClick={updatePassword} size='sm' className='student bg-success-900 text-white'>Reset Password</Button>
            
          </>
        )}
        {message && <p className='instructor text-danger-400 p-1'>{message}</p>}
      </div>

    </div>
  );
}
