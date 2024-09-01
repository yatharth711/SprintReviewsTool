/* 
  This page was part of our original design for the admin portal, however, it was not implemented in the final version of the application. Due to the overall complexity
  of including the possibility of multiple institutions, the feature was cut from the final version of the application. It may be included in future versions of the application. 
  The ability for an admin to create multiple institutions would allow for large scale deployment of the application, and major changes to the database files would be required upon
  implementation. 
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
      <AdminNavbar />
    </>
  );
}
