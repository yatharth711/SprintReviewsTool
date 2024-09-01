/* 
  this page is part of the view users page on the admin portal, however it is a dummy page as the actual page functionality was not implemented.
  It was planned but not implemented due to time constraints. The page is intended to extend the display of all users on the platform, including instructors and students, and 
  allow admin to manage user roles, which can be an extension of join requests as well. The page is added in case the  feature is to be implemented in the future.
*/

import AdminNavbar from "../components/admin-components/admin-navbar";
import AdminHeader from "../components/admin-components/admin-header";
import { useState } from 'react';
import { useSessionValidation } from '../api/auth/checkSession';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Use the session validation hook to check if the user is logged in
  useSessionValidation('admin', setLoading, setSession);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <br />
      <br />
      <br />
      <AdminHeader title="Admin Portal"
      addLink={[{href: "./view-users", title: "View Users"}, {href: "./join-requests", title: "Join Requests"}, {href: "./archived-courses", title: "Archived Courses"}]}/>
      <AdminNavbar admin={{ className: "bg-primary-500" }} />
    </>
  );
}
