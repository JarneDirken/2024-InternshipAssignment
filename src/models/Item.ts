import { Location } from "./Location";

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
}

export interface GroupedItem extends Item {
    count: number;
    availableCount?: number;
}