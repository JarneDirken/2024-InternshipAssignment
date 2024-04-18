import { User } from "@prisma/client";
import { Item } from "./Item";
import { RequestStatus } from "./RequestStatus";

export interface ItemRequest {
    id: number,
    itemId: number,
    requestStatusId: number,
    borrowerId: string,
    approverId?: string,
    requestDate: Date,
    startBorrowDate: Date,
    endBorrowDate: Date,
    decisionDate?: Date,
    borrowDate?: Date,
    returnDate?: Date,
    file?: string,
    receiveMessage?: string,
    approveMessage: string,
    isUrgent?: boolean,
    amountRequest?: number,
    item: Item,
    borrower: User,
    approver?: User,
    requestStatus: RequestStatus
}