'use client';
import Image from 'next/image';
import Link from "next/link";
import { FormEvent, useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail  } from "firebase/auth";
import '../../../services/firebase-config';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import FormControl from '@mui/material/FormControl';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useAuth from '@/hooks/useAuth';

export default function Login() {
    const { isAuthorized } = useAuth(['Student','Teacher','Supervisor','Admin']);
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    async function checkUser() {
        setErrorMessage('');

        const params: Record<string, string> = {
            email
        };

        const queryString = new URLSearchParams(params).toString();

        const response = await fetch(`/api/auth?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            setErrorMessage(errorData.message || "E-mail does not exist or user is not active.");
            return false;
        }
        return true;
    };

    async function handleLogin(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        const userExists = await checkUser();
        if (!userExists) {
            return;
        }
        setErrorMessage('');
        const auth = getAuth();

        const form = new FormData(event.target as HTMLFormElement);
        const email = form.get('email') as string;
        const password = form.get('password') as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/borrow');
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            }
        }
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

    async function handlePasswordReset(){
        if (!email) {
            setErrorMessage('Please specify an email address for password reset.');
            return;
        }

        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert('Password reset email sent!');
            })
            .catch((error) => {
                setErrorMessage(error.message);
            });
    };
    
    useEffect(() => {
        if (isAuthorized) {
            router.push('/borrow');
        }
    }, [isAuthorized, router]);

    return (
        <div className="md:mx-12 flex flex-row justify-center" style={{ height: 'calc(100% - 1rem)' }}>
            {/* Left side - Illustration */}
            <div className="bg-custom-login2 hidden md:flex w-1/2 rounded-tl-3xl rounded-bl-3xl justify-center items-center">
                {/* Replace "illustration.png" with your actual illustration file */}
                    <Image 
                        src="/assets/svg/loginregister/loginRegister1.svg"
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
            <div className='mt-4'>
                <form className="max-w-sm mx-auto p-2" onSubmit={handleLogin}>
                <ThemeProvider theme={theme}>
                    <div className="mb-5">
                        <TextField
                            required
                            id="outlined-required"
                            label="Email"
                            size="small"
                            fullWidth
                            onChange={(e) => setEmail(e.target.value)}
                            className='bg-white'
                            name='email'
                            />
                    </div>
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
                    <div className='mb-8 mt-1 flex justify-end'>
                        <a onClick={handlePasswordReset} className='text-custom-primary underline cursor-pointer'>Forgot password?</a>
                    </div>
                    {/* Form fields */}
                    {errorMessage && (
                        <div className="mb-3 text-red-500 text-sm">
                            {errorMessage}
                        </div>
                    )}
                    <button type="submit" className="text-white bg-black hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full px-5 py-2.5 text-center">Sign in</button>
                </ThemeProvider>
                </form>
            </div>
            <div className='mt-6 flex justify-center items-center'>
                <div className=" border-t border-gray-400 w-16"></div>
                <span className=" mx-4 text-gray-400">or</span>
                <div className=" border-t border-gray-400 w-16"></div>
            </div>
            <div className='mt-2 flex justify-center'>
                <span className='text-sm text-gray-500'>Are you new?&nbsp;</span>
                <Link href="/register"className='text-custom-primary underline text-sm'>
                    Create an Account
                </Link>
            </div>
            </div>
        </div>
    );
}