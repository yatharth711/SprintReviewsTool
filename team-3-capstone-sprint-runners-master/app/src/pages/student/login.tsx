// student/login.tsx
/* eslint-disable @next/next/no-img-element */
import { NextPage } from "next";
import { useRouter } from "next/router";
import styles from "../../styles/student-login.module.css";
import { useState, useEffect } from "react";
import { Button, Chip, Input, Divider } from "@nextui-org/react";
import toast from "react-hot-toast";

const StudentLogin: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { reason } = router.query;

  // Check for the session expiration reason and show an alert
  useEffect(() => {
    if (reason === "Session has expired") {
      toast.error("Session has expired. Please log in again.");
    }
  }, [reason]);

  const handleBackClick = async () => {
    // Redirect to the landing page
    router.push("/");
  };

  const handleSignUpClick = async () => {
    // Redirect to the student dashboard
    router.push("/student/registration");
  };

  const handleForgotPasswordClick = async () => {
    // Redirect to the forgot password page
    router.push("/forgot-password")
  }

  const handleEnter= async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignInClick();
    }
  }

  const handleSignInClick = async () => {
    setError("");

    try {
      const response = await fetch("/api/auth/studentLogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to the student dashboard
        router.push("/student/dashboard");
        toast.success("Login Successful!");
      } else {
        // Handle error response
        const errorData = await response.json();
        setError(errorData.message || 'Failed to authenticate');
        toast.error(`${errorData.message}`);
      }
    } catch (error) {
      // Handle network or other errors
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.")
    }
  };

  return (
    
      <div className="student flex justify-center items-center align-center min-w-[100vw] min-h-[100vh] bg-gradient-to-r from-[#a2cbc7] to-[#265652]">
        <div className="student justify-center text-center bg-white mx-auto my-auto min-w-fit p-[2vw] max-w-max flex border-solid border-2 border-[#39776f] ">
          <div >
            <div className="justify-self-center p-4 pl-2 bg-[#c0dfdc] text-primary flex text-center items-center">
            <img className="m-0 mr-2 object-cover cursor-pointer w-[2vw] h-[2vw]" alt="Back" src="/images/student/Back-Student.png" onClick={handleBackClick} aria-label='Back to Landing Page'/>
              <h2 className="text-center mx-auto">Student Login Portal</h2>
            </div>
            
            
            <Input className="my-1 p-2" type="email" labelPlacement="inside" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input  className="my-1 p-2" type="password" labelPlacement="inside" label="Password" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={handleEnter}/>
            <Button className="bg-primary text-white my-1 w-full text-medium " variant="solid" onClick={handleSignInClick}>
              Sign In
            </Button>
            <div className="flex-column align-center justify-center text-center">
              <Button className="bg-white h-fit w-fit my-1 mb-3 text-xs text-[#39776f]" variant="solid" onClick={handleForgotPasswordClick}>
                Forgot Your Password?
              </Button><Divider orientation="horizontal" className="bg-primary" />
              <p className="mt-3 p-1 text-small">Don't have an account?</p>
              <Button className="w-fit h-5" color="primary" variant="flat" onClick={handleSignUpClick}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

    
  );
};

export default StudentLogin;
