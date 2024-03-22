"use client";
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

export default function Header(){
  const [isOpen, setIsOpen] = useState(false);

  // Effect to control body scroll based on overlay state
  useEffect(() => {
    if(isOpen) {
      document.body.classList.add('overflow-hidden', 'h-screen');
    } else {
      document.body.classList.remove('overflow-hidden', 'h-screen');
    }
  }, [isOpen]);

  return (
    <nav className="flex justify-between md:justify-start p-4 align-middle bg-opacity-0">
      {/* HAMBURGER OR CLOSE ICON */}
      <div className="hamburger md:hidden z-20 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
      </div>
      {/* LOGO */}
      <div className="ml-4 z-20">
        <Link href="/">
            <Image 
              src="/assets/images/logo.png"
              width={80}
              height={80}
              alt="Logo"
              priority
            />
        </Link>
      </div>
      {/* MOBILE NAVBAR */}
      <div 
        id="menu-overlay"
        className={`fixed top-0 left-0 h-screen w-full md:w-auto bg-white z-10 transition-transform duration-500 ease-in-out 
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className='p-8 mt-16'>
          <h1 className='font-bold text-lg'>Links</h1>
          <div>Borrow</div>
          <div>Return</div>
          <div>History</div>
          <div className='border-b my-6'></div>
          <h1 className='font-bold text-lg'>Supervisor</h1>
          <div>Requests</div>
          <div>Repairs</div>
          <div className='border-b my-6'></div>
          <h1 className='font-bold text-lg'>Admin</h1>
          <div>Products</div>
          <div>Locations</div>
          <div>Users</div>
          <div className='border-b my-6'></div>
          <div>Log out</div>
        </div>
      </div>
      {/* PC NAVBAR */}
      <div className='hidden md:flex items-center justify-between w-full'>
        <div className="flex ml-24 gap-20">
          <Link href="/">
            Home
          </Link>
        </div>
        <div className='flex items-center gap-4'>
          <Link href="/login">
            Sign in
          </Link>
          <Link href="/register">
            <button className="px-12 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition duration-300">Create account</button>
          </Link>
          </div>
      </div>
    </nav>
  );
}
