'use client';
import { useEffect, useState } from 'react';
import '../services/firebase-config';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function useAuth(allowedRoles: string[] = []) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uid: user.uid }),
          });
  
          if (response.ok) {
            const { role } = await response.json();
            if (allowedRoles.includes(role)) {
              setIsAuthorized(true);
            } else {
              router.push('/unauthorized');
            }
          } else {
            // Handle error or unauthorized access
            router.push('/login');
          }
      }
    });
  }, [router, allowedRoles]);

  return isAuthorized;
}

export default useAuth;
