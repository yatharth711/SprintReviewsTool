// This file is used to check the session of the user and return the user's session if it exists
// it will be called at the start of every page that requires a user to have a role
import { useRouter } from 'next/router';
import { useEffect, useCallback } from 'react';

// Check that an active session exists, and the user's role matches the page's role
export async function checkSession(role: string) {
  try {
    const response = await fetch('/api/auth/getSession');
    if (!response.ok) {
      const data = await response.json();
      if (data.message === 'Session has expired') {
        throw new Error('Session has expired');
      } else {
        throw new Error('Failed to fetch session');
      }
    }
    const data = await response.json();
    if (data.user.role === 'admin' && role === 'instructor') {
      // If an admin is trying to access an instructor page
      return { isValid: true, session: data };
    } else if (!data || data.user.role !== role) {
      return { isValid: false, session: null };
    }
    return { isValid: true, session: data };
  } catch (error: any) {
    if (error.message === 'Session has expired') {
      console.error('Session has expired:', error);
      return { isValid: false, session: null, reason: 'Session has expired' };
    } else {
      console.error('Failed to fetch session:', error);
      return { isValid: false, session: null };
    }
  }
}

// Use session data to ensure user is logged in, if not send them to their specific login page
export async function useSessionValidation(role: string, setLoading: (loading: boolean) => void, setSession: (session: any) => void) {
  const router = useRouter();

  const verifySession = useCallback(async () => {
    const { isValid, session, reason } = await checkSession(role);
    if (!isValid) {
      if (role.trim() === 'admin') {
        router.push(`/instructor/login?reason=${reason || ''}`);
      } else {
        router.push(`/${role}/login?reason=${reason || ''}`);
      }
    } else {
      setSession(session);
    }
    setLoading(false);
  }, [router, role, setLoading, setSession]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);
}
