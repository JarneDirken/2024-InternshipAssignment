"use client";
import { atom } from 'recoil';
import { User } from '@/models/User';

export const userProfileState = atom<User | null>({
    key: 'userProfileState',
    default: null,
});