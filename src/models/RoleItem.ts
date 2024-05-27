import { Item } from "./Item";
import { Role } from "./Role";

export interface RoleItem {
    id: number,
    itemId: number,
    roleId: number,
    role: Role,
    Item: Item
}