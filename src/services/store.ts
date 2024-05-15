"use client";
import { atom } from 'recoil';
import { User } from '@/models/User';
import { GroupedItem, Item } from '@/models/Item';
import { ItemRequest } from '@/models/ItemRequest';

export const userProfileState = atom<User | null>({
    key: 'userProfileState',
    default: null,
});

export const itemsState = atom<GroupedItem[] | []>({
    key: 'itemsState',
    default: [],
});

export const createRequest = atom({
    key: 'createRequest',
    default: false,
});

export const updateRequest = atom({
    key: 'updateRequest',
    default: false,
});

export const requestsState = atom<ItemRequest[]>({
    key: 'requestsState',
    default: [],
});

export const repariState = atom({
    key: 'repariState',
    default: false,
});