import { GroupedItem, Item } from "./Item";

export interface CartItem {
    item: Item | GroupedItem;
    borrowDetails: {
        startDateTime: Date | null;
        endDateTime: Date | null;
        isUrgent: boolean;
        file: string | null;
        amount: string | null; // amount of items we want to order NOTHING TO DO WITH HOW MANY ITEMS IN GROUP
    };
}
