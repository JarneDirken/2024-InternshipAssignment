"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Avatar } from '@mui/material';
import '../../services/firebase-config';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useRouter } from 'next/navigation';

export default function Header(){
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
}, [auth]);

  const handleLogout = () => {
    const auth = getAuth();
    auth.signOut();
    setUser(null);
};

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <nav className="flex justify-between md:justify-start p-4 align-middle bg-opacity-0">
      {/* LOGO */}
      <div className="ml-4 z-20">
        <Link href="/">
            <Image 
              src="/assets/images/logo.png"
              width={78.38}
              height={78.38}
              alt="Logo"
              priority
            />
        </Link>
      </div>
      {/* PC NAVBAR */}
      <div className='hidden md:flex items-center justify-between w-full'>
        <div className="flex ml-24 gap-20">
          <Link href="/">
            Home
          </Link>
          {user && (
            <Link href="/borrow">
              Dashboard
            </Link>
          )}
        </div>
        {/* Display user avatar and logout if logged in */}
        {user ? (
            <div>
                <Avatar onClick={handleClick} className='cursor-pointer'>{user && user.email ? user.email[0] : ''}</Avatar>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => router.push('/profile')}>Profile</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </div>
        ) : (
            <div className='flex items-center gap-4'>
                <Link href="/login">
                    Sign in
                </Link>
                <Link href="/register">
                    <button className="px-12 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition duration-300">
                        Create account
                    </button>
                </Link>
            </div>
        )}
      </div>
    </nav>
  );
}
