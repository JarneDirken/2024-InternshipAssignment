import { Item } from "./Item";

export interface Repair {
    id: number,
    itemId: number,
    item: Item,
    repairDate: Date,
    returnDate?: Date,
    notes: string
}