'use client';
import Image from 'next/image';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import React, { FormEvent, useState } from 'react';
import '../../../services/firebase-config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function Register() {
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showComfirm, setShowComfirm] = useState(false);

    const handleClickShowComfirm = () => setShowComfirm((show) => !show);
    const handleClickShowPassword = () => setShowPassword((show) => !show);


    const handleMouseDownComfirm = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    }
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    
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
        const thaiTelRegex = /^0[6-9]{1}\d{8}$/; // 0812345678

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

        if (!thaiTelRegex.test(tel)) {
            setErrorMessage('Please enter a valid Thai telephone number.');
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

    const theme = createTheme({
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'orange',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'orange',
                },
              },
            },
          },
          MuiInputLabel: {
            styleOverrides: {
              root: {
                '&.Mui-focused': {
                  color: 'orange',
                },
              },
            },
          },
        },
      });

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
            <ThemeProvider theme={theme}>
                <form className="max-w-sm mx-auto p-2" onSubmit={handleRegister}>
                    <div className='flex gap-4'>
                        <div className="mb-5">
                            <TextField
                                required
                                id="outlined-required"
                                label="Firstname"
                                size="small"
                                fullWidth
                                className='bg-white'
                                name='firstname'
                                />
                        </div>
                        <div className="mb-5">
                            <TextField
                                required
                                id="outlined-required"
                                label="Lastname"
                                size="small"
                                fullWidth
                                className='bg-white'
                                name='lastname'
                                />
                        </div>
                    </div>
                    <div className='flex gap-4'>
                        <div className="mb-5">
                        <TextField
                                required
                                id="outlined-required"
                                label="Student code"
                                size="small"
                                fullWidth
                                className='bg-white'
                                name='studentcode'
                                />
                        </div>
                        <div className="mb-5">
                        <TextField
                                required
                                id="outlined-required"
                                label="Telephone"
                                size="small"
                                fullWidth
                                className='bg-white'
                                name='tel'
                                />
                        </div>
                    </div>
                    <div className="mb-5">
                        <TextField
                            required
                            id="outlined-required"
                            label="Email"
                            size="small"
                            fullWidth
                            className='bg-white'
                            name='email'
                        />
                    </div>
                    <div className='flex gap-4'>
                        <div className='mb-5'>
                        <FormControl variant="outlined" size='small' fullWidth className='bg-white' required>
                            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                name='password'
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    edge="end"
                                    >
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                        </div>
                        <div className='mb-5'>
                        <FormControl variant="outlined" size='small' fullWidth className='bg-white' required>
                            <InputLabel htmlFor="outlined-adornment-password">Confirm</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                name='confpassword'
                                type={showComfirm ? 'text' : 'password'}
                                endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowComfirm}
                                    onMouseDown={handleMouseDownComfirm}
                                    edge="end"
                                    >
                                    {showComfirm ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                        </div>
                    </div>
                    {/* Form fields */}
                    {errorMessage && (
                        <div className="mb-3 text-red-500 text-sm">
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Register</button>
                </form>
                </ThemeProvider>
            </div>
            <div className='mt-3 flex justify-center items-center'>
                <div className=" border-t border-gray-400 w-16"></div>
                <span className=" mx-4 text-gray-400">or</span>
                <div className=" border-t border-gray-400 w-16"></div>
            </div>
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