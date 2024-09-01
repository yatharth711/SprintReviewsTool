import type { NextPage } from "next";
import style from "../../../styles/student-components.module.css";
import { useRouter } from "next/router";
import Image from 'next/image';
import { Button, Link } from "@nextui-org/react";
//TODO: Add logo and images per button


interface ButtonProps { //used to pass css styles to Button type
  className?: string;
}
interface StudentNavbarProps { //used to accept a Button prop for each specific button
  home?: ButtonProps;
  courses?: ButtonProps;
  assignments?: ButtonProps;
  grades?: ButtonProps;
  profile?: ButtonProps;
  settings?: ButtonProps;
}

const StudentNavbar: NextPage<StudentNavbarProps> = ({ home, courses, assignments, grades, profile, settings }) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/student/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (

    <div className={style.navbar}>
      <nav className="student bg-secondary h-[100vh] p-1">
        <Image
          className="bg-secondary-100 rounded-full mx-auto mt-1"
          src="/logo-transparent-png.png"
          alt="SprintRunners Logo"
          width={90}
          height={90}
        />
        <div

          className={style.navButton}
          
        >
          <Link onClick={() => handleNavigation("/student/dashboard")} className={`w-[98%] p-2 mt-2 ${home?.className} `} ><img className={style.navImg} src="/images/Student/Home.png"/>Home</Link>

        </div>
        <div
          className={style.navButton}
         
        >
          <Link  onClick={() => handleNavigation("/student/all-assignments")} className={`w-[98%] p-2  ${assignments?.className}`} ><img className={style.navImg} src="/images/Student/Assignments.png"/>Assignments</Link>
        </div>
        {/* <div
          className={style.navButton}
         
        >
          <Link  onClick={() => handleNavigation("/student/grades")} className={`w-[98%] p-2  ${grades?.className}`} ><img className={style.navImg} src="/images/Student/Grades.png"/>Grades</Link>
        </div> */}
        <div
          className={style.navButton}
         
        >
          <Link  onClick={() => handleNavigation("/student/profile")} className={`w-[98%] p-2  ${profile?.className}`} ><img className={style.navImg} src="/images/Student/Profile.png"/>Profile</Link>
        </div>
        <div
          className={style.navButton}
          
        >
          <Link onClick={() => handleNavigation("/student/settings")} className={`w-[98%] p-2  ${settings?.className}`} ><img className={style.navImg} src="/images/Student/Settings.png"/>Settings</Link>
        </div>
        <div
        className={style.logoutWrapper}
        >
          <div
            className={style.navButton}
           
          >
            <Link className="w-[98%] p-2 " onClick={() => handleLogout()} ><img className={style.navImg} src="/images/Student/Logout.png"/>Logout</Link>
          </div>
        </div>
      </nav>
    </div>

  );
};

export default StudentNavbar;
