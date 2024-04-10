import { Item } from "./Item";

export interface CartItem {
    item: Item;
    borrowDetails: {
        startDateTime: string;
        endDateTime: string;
        isUrgent: boolean;
        file: File | null;
        amount: string | null;
    };
}
