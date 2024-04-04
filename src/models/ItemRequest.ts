import { User } from "@prisma/client";
import { Item } from "./Item";
import { RequestStatus } from "./RequestStatus";

export interface ItemRequest {
    id: number,
    itemId: number,
    requestStatusId: number,
    borrowerId: number,
    approverId: number,
    requestDate: Date,
    starBorrowDate: Date,
    endBorrowDate: Date,
    decisionDate?: Date,
    borrowDate?: Date,
    returnDate?: Date,
    file?: String,
    receiveMessage?: String,
    approveMessage: string,
    isUrgent?: boolean,
    amountRequest?: number,
    item: Item,
    borrower: User,
    approver?: User,
    requestStatus: RequestStatus
}