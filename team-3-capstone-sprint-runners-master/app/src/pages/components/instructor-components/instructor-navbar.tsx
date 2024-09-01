import type { NextPage } from "next";
import style from "../../../styles/instructor-components.module.css";
import { useRouter } from "next/router";
import Image from 'next/image';
import { Link } from "@nextui-org/react";
//TODO: Add logo and images per button
interface ButtonProps { //used to pass css styles to Button type
  className?: string;
}
interface InstructorNavbarProps { //used to accept a Button prop for each specific button
  home?: ButtonProps;
  courses?: ButtonProps;
  assignments?: ButtonProps;
  grades?: ButtonProps;
  profile?: ButtonProps;
  settings?: ButtonProps;
}
const InstructorNavbar: NextPage<InstructorNavbarProps> = ({ home, courses, assignments, grades, profile, settings }) => {
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
        router.push('/instructor/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className={style.navbar}>
      <nav className="instructor bg-primary-800 h-[100vh] p-1 text-primary-50 ">
        <Image
          className="bg-primary-50 rounded-full mx-auto mt-1"
          src="/logo-transparent-png.png"
          alt="SprintRunners Logo"
          width={90}
          height={90}
        />
        <div
          className={style.navButton}
          onClick={() => handleNavigation("/instructor/dashboard")}
        >
          <Link onClick={() => handleNavigation("/instructor/dashboard")} className={`w-[98%] p-2 mt-2 ${home?.className} text-primary-50 `} ><img className={style.navImg} src="/images/Instructor/Home.png" />Home</Link>
        </div>
        <div
          className={style.navButton}
          onClick={() => handleNavigation("/instructor/assignments")}
        >
          <Link onClick={() => handleNavigation("/instructor/assignments")} className={`w-[98%] p-2  ${assignments?.className} text-primary-50 `} ><img className={style.navImg} src="/images/Instructor/Assignments.png" />Assignments</Link>
        </div>
        {/* <div
          className={style.navButton}
          onClick={() => handleNavigation("/instructor/overall-performance")}
        >
          <Link onClick={() => handleNavigation("/instructor/overall-performance")} className={`w-[98%] p-2  ${grades?.className} text-primary-50 `} ><img className={style.navImg} src="/images/Instructor/Grades.png" />Grades</Link>
        </div> */}
        <div
          className={style.navButton}
          onClick={() => handleNavigation("/instructor/profile")}
        >
          <Link onClick={() => handleNavigation("/instructor/profile")} className={`w-[98%] p-2  ${profile?.className} text-primary-50 `} ><img className={style.navImg} src="/images/Instructor/Profile.png" />Profile</Link>
        </div>
        <div
          className={style.navButton}
          onClick={() => handleNavigation("/instructor/settings")}
        >
          <Link onClick={() => handleNavigation("/instructor/settings")} className={`w-[98%] p-2  ${settings?.className} text-primary-50 `} ><img className={style.navImg} src="/images/Instructor/Settings.png" />Settings</Link>

        </div>
        <div className={style.logoutWrapper}>
          <div
            className={style.navButton}
            onClick={() => handleLogout()}
          >
            <Link className="w-[98%] p-2 text-primary-50 " onClick={() => handleLogout()} ><img className={style.navImg} src="/images/Instructor/Logout.png" />Logout</Link>

          </div>
        </div>
      </nav>
    </div>

  );
};

export default InstructorNavbar;
