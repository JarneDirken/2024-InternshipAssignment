export interface Notification {
    id: string;
    message: string;
    isRead: boolean;
    fromRole: string;
    toRole: string[];
    timeStamp: Date;
    requestId?: number;
    userId?: number;
}