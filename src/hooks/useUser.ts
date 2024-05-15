import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';

const useUser = () => {
    const [userId, setUserId] = useState<string | null>(null); // userID
    const [token, setToken] = useState<string | null>(null);
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // Set the user ID from the user object
                setUserId(user.uid);
                
                // Get the ID token
                user.getIdToken(true).then(idToken => {
                    setToken(idToken);
                }).catch(error => {
                    console.error("Failed to get ID token:", error);
                    setToken(null);
                });
            } else {
                setUserId(null);
                setToken(null);
            }
        });

        // Cleanup function to unsubscribe when the component unmounts
        return () => unsubscribe();
    }, []); // Removed userId from dependencies to avoid re-triggering the effect when userId changes

    return { userId, token };
};

export default useUser;
