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
    type DayjsSetterType = (value: Dayjs | null) => void;
    type StringSetterType = (value: string) => void;
    const { enqueueSnackbar } = useSnackbar(); // snackbar popup

    useEffect(() => {
        getParameters();
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
            setTime('morningStartTime', setStartMorningTime, setStartMorningTimeString);
            setTime('morningEndTime', setEndMorningTime, setEndMorningTimeString);
            setTime('eveningStartTime', setStartEveningTime, setStartEveningTimeString);
            setTime('eveningEndTime', setEndEveningTime, setEndEveningTimeString);
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
        <div>
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
            </ThemeProvider>
            <Button 
                text='Save'
                onClick={updateParameters}
            />
        </div>
    );
}
