'use client';
import { useSnackbar } from "notistack";
import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { TextField } from '@mui/material';
//icons
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useState } from "react";
import { User } from "@/models/User";
import Button from "@/components/states/Button";
import { Checkbox, FormGroup } from "@mui/material";
import Tooltip from '@mui/material/Tooltip';

import { Role } from "@/models/Role";

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    onItemsUpdated: () => void;
    selectedItems?: User[];
    roles: Role[];
    mode: 'add' | 'edit' | 'delete';
    userId: String | null;
    token: String | null;
}

export default function Modal({ open, onClose, onItemsUpdated, selectedItems, roles, mode, userId, token }: ModalCardProps) {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#FFA500', // A hex code for a shade of orange
            },
        },
        components: {
            MuiOutlinedInput: {
                styleOverrides: {
                    root: {
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500',
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: {
                        '&.Mui-focused': {
                            color: '#FFA500',
                        },
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        color: 'inherit', // Uses default text color
                        backgroundColor: 'inherit', // Uses default background color
                        '&:hover': {
                            color: '#FFA500', // Orange text on hover
                            backgroundColor: 'inherit',
                        },
                        textTransform: 'none', // Avoids capitalizing text
                    },
                },
            },
            MuiSelect: {
                styleOverrides: {
                    select: {
                        '&:focus': {
                            backgroundColor: 'inherit', // Avoids changing background on focus
                        },
                    },
                    icon: {
                        color: '#FFA500', // Sets the dropdown icon color
                    },
                },
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: {
                        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#FFA500', // Outlined input border color on focus
                        },
                    },
                    popper: {
                        '& .MuiAutocomplete-paper': {
                            borderColor: '#FFA500', // Border color for the options list
                        },
                    },
                },
            },
        },
    });

    const { enqueueSnackbar } = useSnackbar(); // snackbar popup
    const items = selectedItems || [];

    const primitiveUserId = userId ? String(userId) : null; // uid from firebase

    // Item error states
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [studentCodeError, setStudentCodeError] = useState('');
    const [telephoneError, setTelephoneError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [roleError, setRoleError] = useState('');

    // Item states
    const [firstName, setFirstName] = useState<string | null>(null);
    const [lastName, setLastName] = useState<string | null>(null);
    const [studentCode, setStudentCode] = useState<string | null>(null);
    const [telephone, setTelephone] = useState<string | null>(null);
    const [email, setEmail] = useState<string>('');
    const [userActive, setUserActive] = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

    const resetErrors = () => {
        setFirstNameError('');
        setLastNameError('');
        setStudentCodeError('');
        setTelephoneError('');
        setEmailError('');
        setRoleError('');
    }

    const resetFields = () => {
        setFirstName(null);
        setLastName(null);
        setStudentCode(null);
        setTelephone(null);
        setEmail('');
        setUserActive(true);
        setSelectedRoleId(null);
        resetErrors();
    };

    useEffect(() => {
        if (mode === 'edit' && items.length === 1) {
            const item = items[0];
            setFirstName(item.firstName || null);
            setLastName(item.lastName || null);
            setStudentCode(item.studentCode || null);
            setTelephone(item.tel|| null);
            setEmail(item.email || '');
            setUserActive(item.active);
            setSelectedRoleId(item.role ? item.role.id : null);
        } else if (mode === 'add') {
            // Reset all states to default for adding new item
            resetFields();
        }
    }, [items, mode]);

    const handleSuccess = () => {
        onItemsUpdated();
        onClose();
    };

    const validateFields = () => {
        let isValid = true;
        resetErrors();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const role = roles.find(role => role.id === selectedRoleId);
        const isStudentRole = role && role.name === 'Student';

        if (!firstName) {
            setFirstNameError('First name is required.');
            isValid = false;
        }
        if (!lastName) {
            setLastNameError('Last name is required.');
            isValid = false;
        }
        if (isStudentRole) {
            if (!studentCode) {
                setStudentCodeError('Student Code is required for students.');
                isValid = false;
            } else if (studentCode.length !== 8) {
                setStudentCodeError('Student Code must be exactly 8 characters.');
                isValid = false;
            }
        }
        if (!telephone) {
            setTelephoneError('Telephone is required.');
            isValid = false;
        }
        if (email === '') {
            setEmailError('Email is required.');
            isValid = false;
        } else if (!emailPattern.test(email)) {
            setEmailError('Invalid email format.');
            isValid = false;
        }
        if (!selectedRoleId) {
            setRoleError('Role is required.');
            isValid = false;
        } 
        return isValid;
    };

    const handleAdd = async () => {
        if (!validateFields()) {
            enqueueSnackbar('Please correct the errors before submitting.', { variant: 'error' });
            return;
        }

        // Logic to handle add
        const data = {
            firstName: firstName,
            lastName: lastName,
            studentCode: studentCode,
            tel: telephone,
            email: email,
            roleId: selectedRoleId,
            active: userActive,
            userId: primitiveUserId,
            token: token,
        };

        const response = await fetch(`/api/admin/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('User successfully created', { variant: 'success' });
        } else {
            console.error('Failed to create user');
        }
    };

    const handleEdit = async () => {
        if (!validateFields()) {
            enqueueSnackbar('Please fill in all required fields.', { variant: 'error' });
            return;
        }
        // Logic to handle edit
        const data = {
            id: items[0].id,
            firstName: firstName,
            lastName: lastName,
            studentCode: studentCode,
            tel: telephone,
            email: email,
            roleId: selectedRoleId,
            active: userActive,
            userId: primitiveUserId,
            token: token,
        };

        const response = await fetch(`/api/admin/users/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('User successfully updated', { variant: 'success' });
        } else {
            console.error('Failed to update user');
        }
    };

    const handleSoftDelete = async () => {
        // Logic to handle edit
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
            token: token,
        };

        const response = await fetch(`/api/admin/deleteuser/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('User soft deleted', { variant: 'warning' });
        } else {
            console.error('Failed to soft delete user');
        }
    };

    const handlePermanentDelete = async () => {
        const data = {
            userId: primitiveUserId,
            id: items[0].id,
            token: token,
        };

        const response = await fetch(`/api/admin/deleteuser/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data: data }),
        });

        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('User permanently deleted', { variant: 'warning' });
        } else {
            console.error('Failed to permanently delete user');
        }
    };

    const handleMultiSoftDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            enqueueSnackbar('No users selected for soft deletion', { variant: 'info' });
            return;
        }

        const ids = selectedItems.map(item => item.id);
    
        const data = {
            userId: primitiveUserId,
            ids: ids,
            token: token,
        };
    
        const response = await fetch(`/api/admin/deleteusers`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
    
        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Users soft deleted', { variant: 'warning' });
            // Update the state or perform any cleanup
        } else {
            console.error('Failed to soft delete users');
            enqueueSnackbar('Failed to soft delete users', { variant: 'error' });
        }
    };

    const handleMultiPermanentDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) {
            enqueueSnackbar('No users selected for permanent deletion', { variant: 'info' });
            return;
        }
    
        const ids = selectedItems.map(item => item.id);
    
        // Proceed to delete items after images have been successfully deleted
        const data = {
            userId: primitiveUserId,
            ids: ids,
            token: token,
        };
    
        const response = await fetch(`/api/admin/deleteusers`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data }),
        });
    
        if (response.ok) {
            handleSuccess();
            enqueueSnackbar('Users permanently deleted', { variant: 'warning' });
            // Update the state or perform any cleanup
        } else {
            console.error('Failed to permanently delete users');
            enqueueSnackbar('Failed to permanently delete users', { variant: 'error' });
        }
    };


    const handleUserActiveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserActive(event.target.checked);
    }

    const handleRoleChange = (event: React.ChangeEvent<{}>, value: Role | null) => {
        setSelectedRoleId(value ? value.id : null);
        setRoleError('');
    };

    const renderContent = () => {
        switch (mode) {
            case 'add':
            case 'edit':
                return (
                    <div className="sm:grid sm:grid-cols-2">
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                label="First Name"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='first name'
                                value={firstName}
                                onChange={(event) => {
                                    setFirstName(event.target.value);
                                    setFirstNameError('');
                                }}
                                error={!!firstNameError}
                                helperText={firstNameError}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                label="Last Name"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='last name'
                                value={lastName}
                                onChange={(event) => {
                                    setLastName(event.target.value);
                                    setLastNameError('');
                                }}
                                error={!!lastNameError}
                                helperText={lastNameError}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                label="Telephone"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='telephone'
                                value={telephone}
                                onChange={(event) => {
                                    setTelephone(event.target.value);
                                    setTelephoneError('');
                                }}
                                error={!!telephoneError}
                                helperText={telephoneError}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                label="E-mail"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='email'
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setEmailError('');
                                }}
                                error={!!emailError}
                                helperText={emailError}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <TextField
                                required
                                label="Student Code"
                                size="small"
                                className='w-11/12 sm:w-10/12'
                                name='student code'
                                type="number"
                                value={studentCode}
                                error={!!studentCodeError}
                                helperText={studentCodeError}
                                onChange={(e) => setStudentCode(e.target.value)}
                                />
                        </div>
                        <div className="flex justify-center mt-4">
                            <Autocomplete
                                size="small"
                                className="w-11/12 sm:w-10/12"
                                disablePortal
                                options={roles}
                                getOptionLabel={(role) => role.name}
                                value={roles.find(role => role.id === selectedRoleId) || null}
                                onChange={handleRoleChange}
                                renderInput={(params) => <TextField {...params} label="Role" required error={!!roleError} helperText={roleError} />}
                            />
                        </div>
                        <div className="flex justify-center mt-4">
                            <FormGroup className="w-11/12 sm:w-10/12">
                                <div className="flex items-center">
                                    <Checkbox 
                                        checked={userActive}
                                        size="small" 
                                        onChange={handleUserActiveChange} 
                                    />
                                    <span className="select-none">Active?</span>
                                </div>
                            </FormGroup>
                        </div>
                    </div>
                );
            case 'delete':
                if (!selectedItems) {
                    return <p>No items selected.</p>;
                } else {
                    return (
                        <>
                            {selectedItems.length === 1 && (
                                <div className="flex justify-center">
                                    <div className="px-4 grid grid-cols-4 sm:flex sm:justify-around sm:w-full">
                                        <div className="col-span-2">
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">First Name&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].firstName} placement="top-start">
                                                    <span>{selectedItems[0].firstName}</span>
                                                </Tooltip>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Last Name&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].lastName} placement="top-start">
                                                    <span>{selectedItems[0].lastName}</span>
                                                </Tooltip>
                                            </div>
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">Telephone&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].tel} placement="top-start">
                                                    <span>{selectedItems[0].tel}</span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="truncate">
                                                <span className="font-medium text-gray-400">E-mail&nbsp;</span><br/>
                                                <Tooltip title={selectedItems[0].email} placement="top-start">
                                                    <span>{selectedItems[0].email}</span>
                                                </Tooltip>
                                            </div>
                                            {selectedItems[0].studentCode && (
                                                <div className="truncate">
                                                    <span className="font-medium text-gray-400">Student Code&nbsp;</span><br/>
                                                    <Tooltip title={selectedItems[0].studentCode} placement="top-start">
                                                        <span>{selectedItems[0].studentCode}</span>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {selectedItems.length > 1 && (
                                <div className="flex justify-center">
                                    <div>
                                        <p className="mb-3 sm:text-xl font-semibold">Are you sure you want to delete {selectedItems.length} users?</p>
                                        <div>
                                            {selectedItems.map((selectedItem) => (
                                                <div key={selectedItem.id} className="flex items-center gap-3 mt-1">
                                                    <div className="truncate">
                                                    <span className="sm:font-medium sm:text-lg text-gray-400">User&nbsp;</span><br/>
                                                        <Tooltip title={`${selectedItem.firstName} ${selectedItem.lastName}`} placement="top-start" arrow>
                                                            <span className="sm:text-lg sm:font-medium">{`${selectedItem.firstName} ${selectedItem.lastName}`}</span>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    );
                }
        }
    };

    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
            <Box className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[60%] lg:w-[50%] rounded-lg shadow-lg max-h-[70%] flex flex-col">
                <ThemeProvider theme={theme}>
                    <div className="flex justify-between items-center py-3 px-4 border-b-2 border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="font-bold my-auto">{mode === 'add'? <PeopleAltOutlinedIcon /> : mode === 'edit' ? <PeopleAltOutlinedIcon /> : <WarningAmberRoundedIcon className="text-custom-red text-3xl" />}</span>
                            <span className={`font-bold ${mode === 'delete' ? 'text-custom-red' : ''}`}>
                                {mode === 'add' ? 'Add user' : mode === 'edit' ? 'Edit user' :
                                selectedItems?.length === 1 ? "You're about to delete this user. Are you sure?" :
                                "Delete users"}
                            </span>
                        </div>
                        <div onClick={onClose}>
                            <span><CloseOutlinedIcon /></span>
                        </div>
                    </div>
                    <div id="modal-description" className="modal-body h-full p-3 overflow-y-auto">
                        {renderContent()}
                    </div>
                    <div className="flex justify-around py-3 px-4 border-t-2 border-gray-200">
                        <div onClick={onClose}>
                            <Button 
                                paddingX="px-2"
                                textColor="gray-500" 
                                borderColor="gray-500"
                                textClassName={`font-semibold select-none ${mode === 'delete' ? 'text-xs' : ''}`} 
                                text="Cancel"
                            />
                        </div>
                        {mode === 'add' && (    // Only show add button if mode is add  
                            <div onClick={handleAdd}>
                                <Button 
                                    icon={<CheckCircleOutlineIcon className="text-xl" />}
                                    textColor="custom-green" 
                                    borderColor="custom-green"
                                    buttonClassName="hover:border-custom-green-hover"
                                    textClassName="font-semibold select-none group-hover:text-custom-green-hover" 
                                    text="Add"
                                />
                            </div>
                        )}
                        {mode === 'edit' && (   
                            <div onClick={handleEdit}>
                                <Button 
                                    icon={<CheckCircleOutlineIcon className="text-xl" />}
                                    textColor="custom-green" 
                                    borderColor="custom-green"
                                    buttonClassName="hover:border-custom-green-hover"
                                    textClassName="font-semibold select-none group-hover:text-custom-green-hover" 
                                    text="Save"
                                />
                            </div>
                        )}
                        {mode === 'delete' && (     // Only show delete button if mode is delete
                            <>
                                {selectedItems && (
                                    <>
                                        {(selectedItems.length > 1 || (selectedItems.length === 1 && selectedItems[0].active)) && (
                                            <div onClick={() =>{
                                                if (selectedItems?.length === 1) {
                                                    handleSoftDelete();
                                                } else {
                                                    handleMultiSoftDelete();
                                                }
                                            }}>
                                                <Button 
                                                    paddingX="px-2"
                                                    textColor="custom-dark-blue" 
                                                    borderColor="custom-dark-blue"
                                                    buttonClassName="hover:bg-blue-200 transition-colors"
                                                    textClassName="font-semibold text-xs select-none" 
                                                    text="Soft Delete"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}
                                <div onClick={() => {
                                    if (selectedItems?.length === 1) {
                                        handlePermanentDelete();
                                    } else {
                                        handleMultiPermanentDelete();
                                    }
                                }}>
                                    <Button 
                                        paddingX="px-2"
                                        textColor="custom-red" 
                                        borderColor="custom-red"
                                        buttonClassName="hover:bg-red-200 transition-colors"
                                        textClassName="font-semibold text-xs select-none" 
                                        text="Permanent Delete"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </ThemeProvider>
            </Box>
        </MaterialUIModal>
    );
}