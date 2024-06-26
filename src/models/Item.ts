import { ItemRequest } from "./ItemRequest";
import { Location } from "./Location";
import { RoleItem } from "./RoleItem";
import { Repair } from "./Repair";

export interface Item {
    id: number,
    locationId:   number,
    itemStatusId: number,
    name: string,
    model: string,
    brand: string,
    image?: string,
    yearBought?: Date,
    active: boolean,
    number: string,
    notes?: string,
    schoolNumber?: string,
    location: Location,
    consumable: boolean,
    amount?: number,
    ItemRequests?: ItemRequest[],
    RoleItem?: RoleItem[],
    itemStatus?: {
        id: number;
        name: string;
    },
    Reparations?: Repair[],
}

export interface GroupedItem extends Item {
    borrowedCount: number;
    availableCount: number;
    groupStatusId?: number;
    items: Item[]; // Array to store all items within the group
}