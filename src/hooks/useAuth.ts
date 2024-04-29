'use client';
import { useEffect, useState } from 'react';
import '../services/firebase-config';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function useAuth(allowedRoles: string[] = []) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!user) {
              router.push('/login');
          } else {
              try {
                  const response = await fetch('/api/auth', {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({ uid: user.uid }),
                  });

                  if (response.ok) {
                      const { role } = await response.json();
                      setUserRole(role);
                      setIsAuthorized(allowedRoles.includes(role));
                  } else {
                      router.push('/login');
                  }
              } catch (error) {
                  console.error('Authorization check failed:', error);
                  router.push('/login');
              }
          }
          setLoading(false);
      });

      return () => {
          unsubscribe();
          setLoading(false);
      };
  }, [router, allowedRoles]);

  return { userRole, isAuthorized, loading };
}

export default useAuth;