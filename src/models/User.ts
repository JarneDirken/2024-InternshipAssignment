export interface User {
    roleId: number;
    firebaseUid: string;
    firstName: string;
    lastName: string;
    email: string;
    studentCode: string;
    tel: string;
    createdAt: Date;
    role: {id: number, name: string};
    profilePic?: string;
}