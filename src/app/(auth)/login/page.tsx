'use client';
import Image from 'next/image';
import Link from "next/link";
import { FormEvent, useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

export default function Login() {
    const [errorMessage, setErrorMessage] = useState('');
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    async function handleLogin(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        setErrorMessage('');
        const auth = getAuth();

        const form = new FormData(event.currentTarget);
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
    }

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
                    <div className="mb-5">
                    <ThemeProvider theme={theme}>
                        <TextField
                            required
                            id="outlined-required"
                            label="Email"
                            size="small"
                            fullWidth
                            className='bg-white'
                            name='email'
                            />
                    </ThemeProvider>
                    </div>
                    <div>
                    <ThemeProvider theme={theme}>
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
                    </ThemeProvider>
                    </div>
                    <div className='mb-8 mt-1 flex justify-end'>
                        <a href="#" className='text-custom-primary underline'>Forgot password?</a>
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
            <div className='mt-6 flex justify-center items-center'>
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
                <span className='text-sm text-gray-500'>Are you new?&nbsp;</span>
                <Link href="/register"className='text-custom-primary underline text-sm'>
                    Create an Account
                </Link>
            </div>
            </div>
        </div>
    );
}