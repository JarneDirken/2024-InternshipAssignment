import { GroupedItem, Item } from "./Item";

export interface CartItem {
    item: Item | GroupedItem;
    borrowDetails: {
        startDateTime: Date | null;
        endDateTime: Date | null;
        isUrgent: boolean;
        file: string | null;
        amountRequest: string | null,
    };
}
