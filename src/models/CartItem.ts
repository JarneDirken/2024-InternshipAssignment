import { Item } from "./Item";

export interface CartItem {
    item: Item;
    borrowDetails: {
        startDateTime: Date | null;
        endDateTime: Date | null;
        isUrgent: boolean;
        file: string | null;
        amount: string | null;
    };
}
