'use client';
import React, { useEffect, useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useAuth from '@/hooks/useAuth';
import Loading from '@/components/states/Loading';
import Unauthorized from '../../(error)/unauthorized/page';
import { ParameterType } from '@/models/ParameterType';
import Button from '@/components/states/Button';
import { useSnackbar } from 'notistack';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { InputAdornment, TextField } from '@mui/material';
import { getAuth } from 'firebase/auth';
import {app} from "@/services/firebase-config";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { ClearIcon } from "@mui/x-date-pickers/icons";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { deleteObject, getDownloadURL, getStorage, listAll, ref, uploadBytes } from 'firebase/storage';
import CheckIcon from '@mui/icons-material/Check';

export default function Parameter() {
    const { isAuthorized, loading } = useAuth(['Admin']);
    const [startMorningTime, setStartMorningTime] = useState<Dayjs | null>(null);
    const [endMorningTime, setEndMorningTime] = useState<Dayjs | null>(null);
    const [startEveningTime, setStartEveningTime] = useState<Dayjs | null>(null);
    const [endEveningTime, setEndEveningTime] = useState<Dayjs | null>(null);
    const [startMorningTimeString, setStartMorningTimeString] = useState('');
    const [endMorningTimeString, setEndMorningTimeString] = useState('');
    const [startEveningTimeString, setStartEveningTimeString] = useState('');
    const [endEveningTimeString, setEndEveningTimeString] = useState('');
    const [monringBufferTime, setMorningBufferTime] = useState('');
    const [EveningBufferTime, setEveningBufferTime] = useState('');
    type DayjsSetterType = (value: Dayjs | null) => void;
    type StringSetterType = (value: string) => void;
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const [userId, setUserId] = useState<string | null>(null); // userID
    const auth = getAuth(app); // Get authentication
    const storage = getStorage(app);
    const [templateUrl, setTemplateUrl] = useState('');
    const [stagedFile, setStagedFile] = useState<File | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
            }
        });
        return () => unsubscribe();
    }, [userId]);

    useEffect(() => {
        getParameters();
        fetchCurrentTemplateUrl();
    }, []);

    const handleTimeChange = (dayjsSetter: DayjsSetterType, stringSetter: StringSetterType) => (newValue: Dayjs | null) => {
        if (newValue) {
            const timeOnly = newValue.hour(newValue.hour()).minute(newValue.minute()).second(0);
            dayjsSetter(timeOnly);
            stringSetter(timeOnly.format('HH:mm'));  // Set the string representation
        } else {
            dayjsSetter(null);
            stringSetter('');  // Clear the string when no time is selected
        }
    };

    const isTimeBefore = (time1String: string, time2String: string) => {
        const time1 = dayjs(time1String, 'HH:mm');
        const time2 = dayjs(time2String, 'HH:mm');
        return time1.isBefore(time2);
    };

    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const handleImportUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];  // Use optional chaining to safely access the file
        if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            setStagedFile(file);
        }
    };
    
    const handleDropImport = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];  // Use optional chaining to safely access the file
        if (file && file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            setStagedFile(file);  // Store the file for staged upload instead of directly uploading
        }
    };

    async function getParameters() {
        try {
            const response = await fetch(`/api/admin/parameter`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data: ParameterType[] = await response.json();
            
            // Define setTime with explicit types for parameters
            const setTime = (paramName: string, dayjsSetter: DayjsSetterType, stringSetter: React.Dispatch<React.SetStateAction<string>>) => {
                const param = data.find(p => p.name === paramName);
                if (param) {
                    const [hour, minute] = param.value.split(':');
                    const dayjsTime = dayjs().hour(parseInt(hour)).minute(parseInt(minute)).second(0);
                    dayjsSetter(dayjsTime);
                    stringSetter(param.value);
                }
            };

            // Define setBufferTime for buffer time parameters
            const setBufferTime = (paramName: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
                const param = data.find(p => p.name === paramName);
                if (param) {
                    setter(param.value); // Directly set the string since buffer time is just a number of minutes
                }
            };

            // Set times
            setTime('morningStartTime', setStartMorningTime, setStartMorningTimeString);
            setTime('morningEndTime', setEndMorningTime, setEndMorningTimeString);
            setTime('eveningStartTime', setStartEveningTime, setStartEveningTimeString);
            setTime('eveningEndTime', setEndEveningTime, setEndEveningTimeString);

            // Set buffer times
            setBufferTime('morningBufferTime', setMorningBufferTime);
            setBufferTime('eveningBufferTime', setEveningBufferTime);
        } catch (error) {
            console.error("Failed to fetch parameters:", error);
        }
    };

    async function updateParameters() {
        // Validation checks
        if (!isTimeBefore(startMorningTimeString, endMorningTimeString)) {
            enqueueSnackbar('Start Morning Time should be before End Morning Time', { variant: 'error' });
            return;
        }
        if (!isTimeBefore(startEveningTimeString, endEveningTimeString)) {
            enqueueSnackbar('Start Evening Time should be before End Evening Time', { variant: 'error' });
            return;
        }
        if (!isTimeBefore(endMorningTimeString, startEveningTimeString)) {
            enqueueSnackbar('Morning Times should be before Evening Times', { variant: 'error' });
            return;
        }

        const data = {
            morningStartTime: startMorningTimeString,
            morningEndTime: endMorningTimeString,
            eveningStartTime: startEveningTimeString,
            eveningEndTime: endEveningTimeString,
            morningBufferTime: monringBufferTime,
            eveningBufferTime: EveningBufferTime,
            userId,
        };

        const response = await fetch(`/api/admin/parameter/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            enqueueSnackbar('Saved data successfully', { variant: 'success' });
        } else {
            enqueueSnackbar('Failed to save data', { variant: 'error' });
            console.error('Failed to save item data');
        }
    };

    async function fetchCurrentTemplateUrl() {
        const storage = getStorage();
        const directoryRef = ref(storage, 'templates/urgentBorrow/');
    
        try {
            const result = await listAll(directoryRef);
            if (result.items.length > 0) {
                const fileRef = result.items[0];  // Assuming there's at least one file and we take the first one
                const url = await getDownloadURL(fileRef);
                setTemplateUrl(url);
            } else {
                console.error('No files found in the directory.');
            }
        } catch (error) {
            console.error('Failed to list files:', error);
        }
    };

    async function replaceTemplate() {
        if (!stagedFile) return; 
    
        const storage = getStorage();
        const directoryRef = ref(storage, 'templates/urgentBorrow/');
    
        try {
            // List all files in the directory
            const list = await listAll(directoryRef);
            if (list.items.length > 0) {
                // Assume there's only one file and delete it
                await deleteObject(list.items[0]);
            }
    
            // Upload new file
            const newFileRef = ref(storage, `templates/urgentBorrow/${stagedFile.name}`);
            await uploadBytes(newFileRef, stagedFile);
            const url = await getDownloadURL(newFileRef); 
            setTemplateUrl(url);
            setStagedFile(null);
            enqueueSnackbar('Changed urgent borrowing request template succefully', { variant: 'success' });
        } catch (error) {
            console.error('Error replacing template:', error);
        }
    };

    const theme = createTheme({
        palette: {
            primary: {
                main: '#ff9800', // orange color
            },
        },
        components: {
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiInput-input': {
                            color: '#ff9800', 
                        },
                        '& .MuiInput-underline:before': {
                            borderBottomColor: '#ff9800',
                        },
                        '& .MuiInput-underline:after': {
                            borderBottomColor: '#ff9800',
                        },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                            borderBottomColor: '#ff9800',
                        },
                    },
                },
            },
        },
    });

    if (loading || isAuthorized === null) { return <Loading/>; }

    if (!isAuthorized) { return <Unauthorized />; }

    return (
        <div className="rounded-xl bg-white w-full p-4" style={{ height: 'calc(100vh - 129px)' }}>
            <div className='mb-4 flex items-center gap-3'>
                <SettingsOutlinedIcon fontSize="large" />
                <h1 className="font-semibold text-2xl">Parameters</h1>
            </div>
            <div className='flex gap-4 flex-wrap'>
                <ThemeProvider theme={theme}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <TimePicker
                            label="Start Morning Time"
                            value={startMorningTime}
                            onChange={handleTimeChange(setStartMorningTime, setStartMorningTimeString)}
                            views={['hours', 'minutes']}
                        />
                        <TimePicker
                            label="End Morning Time"
                            value={endMorningTime}
                            onChange={handleTimeChange(setEndMorningTime, setEndMorningTimeString)}
                            views={['hours', 'minutes']}
                        />
                        <TimePicker
                            label="Start Evening Time"
                            value={startEveningTime}
                            onChange={handleTimeChange(setStartEveningTime, setStartEveningTimeString)}
                            views={['hours', 'minutes']}
                        />
                        <TimePicker
                            label="End Evening Time"
                            value={endEveningTime}
                            onChange={handleTimeChange(setEndEveningTime, setEndEveningTimeString)}
                            views={['hours', 'minutes']}
                        />
                    </LocalizationProvider>
                    <TextField 
                        label="Morning buffer time"
                        id="outlined-start-adornment"
                        value={monringBufferTime}
                        type="number"
                        onChange={(e) => setMorningBufferTime(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">min</InputAdornment>,
                        }}
                    />
                    <TextField 
                        label="Evening buffer time"
                        id="outlined-start-adornment"
                        type="number"
                        value={EveningBufferTime}
                        onChange={(e) => setEveningBufferTime(e.target.value)}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">min</InputAdornment>,
                        }}
                    />
                </ThemeProvider>
                <Button 
                    text='Save'
                    onClick={updateParameters}
                />
            </div>
            <div className="flex flex-col mt-4">
                <div>
                    Urgent borrow request template:
                </div>
                <div className='flex'>
                    <div className="px-4 grid grid-cols-2">
                        {stagedFile ? (
                            <div className='flex flex-col'>
                                <span className='text-custom-red font-bold text-xl'>Are you sure you want to change the template?</span>
                                <div className='flex gap-2'>
                                    <Button 
                                        icon={<CheckIcon className="text-xl" />}
                                        textColor="custom-dark-green" 
                                        borderColor="custom-dark-green"
                                        textClassName="font-semibold select-none" 
                                        text="Yes I'm sure"
                                        onClick={replaceTemplate}
                                    />
                                    <Button 
                                        icon={<ClearIcon className="text-xl" />}
                                        paddingX="px-4"
                                        textColor="custom-red" 
                                        borderColor="custom-red"
                                        textClassName="font-semibold" 
                                        text="Cancel"
                                        onClick={() => setStagedFile(null)}
                                    />
                                </div>
                        </div>
                        ) : (
                            <div className="col-span-1 flex justify-center items-center">
                                <a href={templateUrl} download target="_blank" rel="noopener noreferrer">
                                    <Button 
                                        icon={<InsertDriveFileOutlinedIcon className="text-xl" />}
                                        textColor="custom-dark-blue" 
                                        borderColor="custom-dark-blue"
                                        textClassName="font-semibold select-none" 
                                        text={templateUrl ? "Current template" : "Loading..."}
                                        disabled={!templateUrl}
                                    />
                                </a>
                            </div>
                        )}
                        {!stagedFile && (
                            <label
                                htmlFor="file-upload"
                                className="mx-auto bg-gray-100 border-2 border-gray-300 border-dotted p-3 flex flex-col justify-center items-center rounded col-span-1"
                                onDragOver={handleDragOver}
                                onDrop={handleDropImport}
                            >
                                <FileUploadOutlinedIcon className="text-gray-600 mb-1.5" />
                                <div className="text-sm">
                                    <span className="text-blue-500 select-none">Click to upload</span><span className="select-none"> or drag and drop</span>
                                </div>
                                <span className="text-xs text-gray-400 select-none">DOCX only.</span>
                                <input
                                    id="file-upload"
                                    type="file"
                                    onChange={handleImportUpload}
                                    className="opacity-0 w-0 h-0"
                                    accept=".docx"
                                />
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
