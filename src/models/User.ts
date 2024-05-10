import { ItemRequest } from "./ItemRequest";

export interface User {
    id: number;
    roleId: number;
    firebaseUid: string;
    firstName: string;
    lastName: string;
    email: string;
    studentCode?: string;
    tel: string;
    active: boolean;
    createdAt: Date;
    role: {id: number, name: string};
    profilePic?: string;
    ItemRequests?: ItemRequest[];
    ItemRequestsBorrower?: ItemRequest[];
}