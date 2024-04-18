"use client";
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "@/services/firebase-config";
import Avatar from '@mui/material/Avatar';
import Loading from '@/components/states/Loading';
import Button from '@/components/states/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useRecoilState } from 'recoil';
import { userProfileState } from '@/services/store';
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CheckIcon from '@mui/icons-material/Check';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export default function Profile() {
    const [profile, setProfile] = useRecoilState(userProfileState);
    const [loading, setLoading] = useState(true);
    const [edit, setEdit] = useState(true);
    const auth = getAuth();
    const [firstName, setFirstName] = useState(profile?.firstName);
    const [lastName, setLastName] = useState(profile?.lastName);
    const [email, setEmail] = useState(profile?.email);
    const [tel, setTel] = useState(profile?.tel);
    const [studentCode, setStudentCode] = useState(profile?.studentCode);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setEdit(false);
                fetchUserProfile(user.uid);
            } else {
                setLoading(false);
            }
        });
    }, []);

    async function fetchUserProfile(uid: string) {
        const endpoint = `/api/userprofile/${uid}`;
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

    function capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    if (loading) {
        return ( <Loading /> );
    }

    if (!profile) {
        return <div>No profile data found.</div>;
    }

    async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file && profile) {
            const storage = getStorage();
            const storageRef = ref(storage, `gs://internshipassignment-c6d15.appspot.com/profilePictures/${profile.firebaseUid}`);
    
            uploadBytes(storageRef, file).then((snapshot) => {
    
                // Get the download URL
                getDownloadURL(snapshot.ref).then(async (downloadURL) => {
                    
                    const response = await fetch(`/api/userprofilepic/`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({ profilePicUrl: downloadURL, uid: profile.firebaseUid }),
                    });
    
                    if (response.ok) {
                        const updatedUser = await response.json();
                        setProfile(updatedUser);
                    } else {
                        console.error('Failed to update image URL in profile');
                    }
                });
            }).catch((error) => {
                console.error('Error uploading file:', error);
            });
        }
    }

    async function RemovePhoto() {
        console.log("clicked");
        if (!profile || !profile.firebaseUid || !profile.profilePic) {
            console.error('No profile or profile picture found');
            return;
        }
    
        const storage = getStorage();
        const fileRef = ref(storage, profile.profilePic);
    
        try {
            // Delete the file from Firebase Storage
            await deleteObject(fileRef);
            console.log('File deleted successfully from Firebase Storage');
    
            // Update the profile in the database
            const response = await fetch(`/api/userprofilepic/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ profilePicUrl: null, uid: profile.firebaseUid }),
            });
    
            if (response.ok) {
                const updatedUser = await response.json();
                setProfile(updatedUser);
            } else {
                console.error('Failed to update user profile in database');
            }
        } catch (error) {
            console.error('Error deleting file:', error);
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

    function handleEditButton(){
        setEdit(!edit);
    }

    async function handleSaveButton(){
        const updatedData = {
            firstName,
            lastName,
            tel,
            studentCode,
        };
        
        const response = await fetch(`/api/userprofile/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: updatedData, uid: profile?.firebaseUid }),
        });
    
        if (response.ok) {
            const updatedUser = await response.json();
            setProfile(updatedUser);
            setEdit(false);
        } else {
            console.error('Failed to update user profile');
        }
    }

    return (
        <>
            <div className='flex gap-1 mb-4 text-2xl items-center font-semibold'>
                <PersonOutlineOutlinedIcon fontSize="large"/>
                <h1>User Profile</h1>
            </div>
            <div className='bg-white rounded-xl py-2'>
                <div className='p-4 flex flex-col md:flex-row gap-6 justify-center mx-auto items-center'>
                    <div>
                    <Avatar sx={{ width: 100, height: 100 }} className='z-0'>
                        {profile.profilePic ? (
                            <img src={profile.profilePic} alt={`${profile.firstName} ${profile.lastName}`} className='z-0' />
                        ) : (
                            <span className='text-4xl'>
                                {capitalizeFirstLetter(profile.firstName[0])}{capitalizeFirstLetter(profile.lastName[0])}
                            </span>
                        )}
                    </Avatar>
                    </div>
                    <div className='flex flex-col justify-center items-center md:items-start'>
                        <div className='flex gap-4 mb-2'>
                            <label htmlFor="profilePicUpload" className="border border-gray-300 rounded-lg items-center justify-center py-1 px-4 flex gap-1 cursor-pointer">
                                Upload new photo
                                <input
                                    type="file"
                                    id="profilePicUpload"
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileChange}
                                />
                            </label>
                            <Button text='Remove' icon={<DeleteIcon fontSize='small'/>} onClick={RemovePhoto}/>
                        </div>
                        <div className='flex flex-col justify-center items-center md:items-start'>
                            <span className='text-sm text-gray-400'>At least 800 x 800 px recommended.</span>
                            <span className='text-sm text-gray-400'>JPG or PNG is allowed</span>
                        </div>
                    </div>
                </div>
                <hr/>
                <div className='m-8 mx-0 lg:mx-24 p-4 border-0 lg:border border-gray-200 rounded-xl'>
                    <div className='flex flex-col w-full'>
                        <div className='flex justify-between items-center mb-4'>
                            <h1 className='font-semibold text-2xl'>Personal Info</h1>
                            { !edit ? (
                                <Button text='Edit' icon={<EditIcon fontSize='small'/>} onClick={handleEditButton}/>
                            ) : (
                                <Button text='Save' icon={<CheckIcon fontSize='small'/>} onClick={handleSaveButton}/>
                            )}
                            
                        </div>
                        <ThemeProvider theme={theme}>
                            <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4'>
                                { !edit ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-500 font-medium'>First name</span>
                                            {profile.firstName}
                                        </div>
                                    ) : (
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="First name"
                                            defaultValue={profile.firstName}
                                            size="small"
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className='bg-white'
                                            name='firstname'
                                        />
                                )}
                                { !edit ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-500 font-medium'>Last name</span>
                                            {profile.lastName}
                                        </div>
                                    ) : (
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Last name"
                                            defaultValue={profile.lastName}
                                            size="small"
                                            onChange={(e) => setLastName(e.target.value)}
                                            className='bg-white'
                                            name='lastname'
                                        />
                                )}
                                <div className='flex flex-col truncate'>
                                    <span className='text-gray-500 font-medium'>Email</span>
                                    {profile.email}
                                </div>
                            </div>
                            <div className='grid sm:grid-cols-2 md:grid-cols-3 gap-4'>
                            { !edit ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-500 font-medium'>Tel</span>
                                            {profile.tel}
                                        </div>
                                    ) : (
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Tel"
                                            defaultValue={profile.tel}
                                            size="small"
                                            onChange={(e) => setTel(e.target.value)}
                                            className='bg-white'
                                            name='tel'
                                        />
                                )}
                                { !edit ? (
                                        <div className='flex flex-col'>
                                            <span className='text-gray-500 font-medium'>Student number</span>
                                            {profile.studentCode}
                                        </div>
                                    ) : (
                                        <TextField
                                            required
                                            id="outlined-required"
                                            label="Student code"
                                            defaultValue={profile.studentCode}
                                            size="small"
                                            onChange={(e) => setStudentCode(e.target.value)}
                                            className='bg-white'
                                            name='studentcode'
                                        />
                                )}
                                <div className='flex flex-col'>
                                    <span className='text-gray-500 font-medium'>Role</span>
                                    <span className='border border-gray-300 rounded-lg items-center justify-center py-1 px-4 w-max text-custom-primary font-semibold'>
                                        {profile.role.name}
                                    </span>
                                </div>
                            </div>
                        </ThemeProvider>
                    </div>
                </div>
            </div>
        </>
    );
}
