"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@/services/firebase-config";
import { User } from '@/models/User';

export default function Profile() {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchUserProfile(user.uid);
            } else {
                setLoading(false);
            }
        });
    }, []);

    async function fetchUserProfile(uid: string) {
        const endpoint = `/api/user/${uid}`;
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }
            const userData = await response.json();
            setProfile(userData);
        } catch (error) {
            console.error("Fetching user profile failed:", error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!profile) {
        return <div>No profile data found.</div>;
    }

    const formattedDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A';

    return (
        <div>
            <h1>User Profile</h1>
            <p>First Name: {profile.firstName}</p>
            <p>Last Name: {profile.lastName}</p>
            <p>Email: {profile.email}</p>
            <p>Tel: {profile.tel}</p>
            <p>Student Code: {profile.studentCode}</p>
            <p>Created at: {formattedDate}</p>
            <p>Level: {profile.role.name}</p>
        </div>
    );
}
