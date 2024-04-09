"use client";
import { atom } from 'recoil';
import { User } from '@/models/User';
import { Item } from '@/models/Item';
import { ItemRequest } from '@/models/ItemRequest';

export const userProfileState = atom<User | null>({
    key: 'userProfileState',
    default: null,
});

export const itemsState = atom<Item[]>({
    key: 'itemsState',
    default: [],
});

export const requestsState = atom<ItemRequest[]>({
    key: 'requestsState',
    default: [],
});