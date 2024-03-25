'use client';
import Image from 'next/image';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import React, { FormEvent, useState } from 'react';
import '../../services/firebase-config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    
    async function handleRegister(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErrorMessage('');

        // get form data
        const form = new FormData(event.currentTarget);
        const firstName = form.get('firstname') as string;
        const lastName = form.get('lastname') as string;
        const studentCode = form.get('studentcode') as string;
        const email = form.get('email') as string;
        const password = form.get('password') as string;
        const confpassword = form.get('confpassword') as string;
        const tel = form.get('tel') as string;

        if (password.length < 6 || confpassword.length < 6) {
            setErrorMessage('Passwords must have at least 6 characters');
            return;
        }
        if (password !== confpassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        if (firstName.length < 2 || lastName.length < 2) {
            setErrorMessage('First name and last name must have at least 2 characters.');
            return;
        }

        if (studentCode.length !== 8) {
            setErrorMessage('Student code must have 8 characters');
            return;
        }

        // get auth from firebase
        const auth = getAuth();

        try {
            // create account with email and password 
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // return the user with userID
            const user = userCredential.user;
            const firebaseUid = user.uid;

            // Get all the data and add to database
            const data = {
                firebaseUid,
                firstName,
                lastName,
                studentCode,
                email,
                tel,
                roleId: 1, // student role
            }
            
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                setErrorMessage("Duplicate constraint found, error to create new user.");
            } else {
                router.push('/borrow');
            }

        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }

        // redirect to /borrow page
    };

    return (
        <div className="md:mx-12 flex flex-row justify-center overflow-hidden" style={{ height: 'calc(100% - 1rem)' }}>
            {/* Left side - Illustration */}
            <div className="bg-custom-login2 hidden md:flex w-1/2 rounded-tl-3xl rounded-bl-3xl justify-center items-center">
                {/* Replace "illustration.png" with your actual illustration file */}
                    <Image 
                        src="/assets/svg/loginregister/loginRegister2.svg"
                        width={500}
                        height={500}
                        alt="Illustration"
                        priority
                    />
            </div>
            {/* Right side - Form */}
            <div className="w-full md:w-1/2 bg-custom-login flex flex-col justify-center md:mx-0 rounded-3xl md:rounded-tl-none md:rounded-bl-none mx-4">
            <div className="flex justify-center mt-6">
                <Image 
                    src="/assets/images/logo.png"
                    width={180}
                    height={180}
                    alt="Logo"
                    priority
                />
            </div>
            <div className='mt-2'>
                <form className="max-w-sm mx-auto p-2" onSubmit={handleRegister}>
                    <div className='flex gap-4'>
                        <div className="mb-3">
                            <label htmlFor="firstname" className="block mb-1 text-sm font-medium text-gray-500">Firstname</label>
                            <input 
                                type="text" 
                                id="firstname"
                                name='firstname' 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primaryblock w-full p-2.5 " 
                                required
                                minLength={2}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="lastname" className="block mb-1 text-sm font-medium text-gray-500">Lastname</label>
                            <input 
                                type="text" 
                                id="lastname"
                                name='lastname'
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primaryblock w-full p-2.5 " 
                                required
                                minLength={2} 
                            />
                        </div>
                    </div>
                    <div className='flex gap-4'>
                        <div className="mb-3">
                            <label htmlFor="studentcode" className="block mb-1 text-sm font-medium text-gray-500">Student code</label>
                            <input 
                                type="number" 
                                id="studentcode"
                                name='studentcode' 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primaryblock w-full p-2.5 " 
                                required
                                minLength={8}
                                maxLength={8} 
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="tel" className="block mb-1 text-sm font-medium text-gray-500">Telephone</label>
                            <input 
                                type="tel" 
                                id="tel"
                                name='tel' 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primaryblock w-full p-2.5 " 
                                required
                            />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-500">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            name='email' 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primaryblock w-full p-2.5 " 
                            required 
                        />
                    </div>
                    <div className='flex gap-4'>
                        <div className='mb-3'>
                            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-500">Password</label>
                            <input 
                                type="password" 
                                name="password" 
                                id="password" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primary block w-full p-2.5" 
                                required 
                                minLength={6}
                                onInput={(e) => e.currentTarget.setCustomValidity('')} 
                                onInvalid={(e) => e.currentTarget.setCustomValidity('Password must be at least 6 characters long')}
                            />
                        </div>
                        <div className='mb-5'>
                            <label htmlFor="confpassword" className="block mb-1 text-sm font-medium text-gray-500">Confirm password</label>
                            <input 
                                type="password" 
                                name="confpassword" 
                                id="confpassword" 
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-custom-primary focus:border-custom-primary block w-full p-2.5 " 
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    {/* Form fields */}
                    {errorMessage && (
                        <div className="mb-3 text-red-500 text-sm">
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Sign in</button>
                </form>
            </div>
            <div className='mt-3 flex justify-center items-center'>
                <div className=" border-t border-gray-400 w-16"></div>
                <span className=" mx-4 text-gray-400">or</span>
                <div className=" border-t border-gray-400 w-16"></div>
            </div>
            {/* <div className='mt-2 flex justify-center'>
                <div className='flex items-center'>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="28" height="28" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    <span className='text-gray-500'>&nbsp;Sign in with google</span>
                </div>
            </div> */}
            <div className='mt-2 flex justify-center'>
                <span className='text-sm text-gray-500'>Already have an account?&nbsp;</span>
                <Link href="/login"className='text-custom-primary underline text-sm'>
                    Log in
                </Link>
            </div>
            </div>
        </div>
    );
}