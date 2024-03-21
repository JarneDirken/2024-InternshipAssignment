// code to fill the database with dummy data
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    await createLocations();
    await createItemStatus();
    await createGeneralItem();
    await createItem();
    await createRole();
    await createRoleItem();
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


async function createLocations() {
    const locationNames = [
        "HF2 - HM Inventory Zone F Storage 2",
        "HF1 - HM Inventory Zone F Storage 1",
        "HF3 - HM Inventory Zone F Storage 3",
        "HE3 - HM Inventory Zone E Storage 3",
        "HE2 - HM Inventory Zone E Storage 2",
        "HE1 - HM Inventory Zone E Storage 1",
        "HD2 - HM Inventory Zone D Storage 2",
        "HD1 - HM Inventory Zone D Storage 1",
        "HB1 - HM Inventory Zone B Storage 1",
        "HC3 - HM Inventory Zone C Storage 3",
        "HC1 - HM Inventory Zone C Storage 1",
        "HC4 - HM Inventory Zone C Storage 4",
        "HA3 - HM Inventory Zone A Storage 3",
        "HC2 - HM Inventory Zone C Storage 2",
        "HA2 - HM Inventory Zone A Storage 2",
        "HA1 - HM Inventory Zone A Storage 1",
        "ECC-ECC305-A",
        "HM Inventory",
        "ECC",
        "CENTRAL LAB"
    ];

    for (const name of locationNames) {
        await prisma.location.upsert({
            where: { name },  // This checks if the location already exists
            update: {},  // If it does, nothing is updated
            create: { name }  // If it doesn't, a new location is created
        });
    }
}

async function createItemStatus() {
    const itemStatusNames = [
        "Borrowed",
        "Available",
        "Repairing",
        "Broken",
    ];

    for (const name of itemStatusNames) {
        await prisma.itemStatus.upsert({
            where: { name },  // This checks if the location already exists
            update: {},  // If it does, nothing is updated
            create: { name }  // If it doesn't, a new location is created
        });
    }
}

async function createGeneralItem() {
    const generalItems = [
        {
            name: "Laptop",
            model: "XPS 15",
            brand: "Dell",
            image: null
        },
        {
            name: "Projector",
            model: "EB-X41",
            brand: "Epson",
            image: null
        }
    ];

    for (const item of generalItems) {
        await prisma.generalItem.upsert({
            where: { name: item.name },
            update: {},
            create: {
                name: item.name,
                model: item.model,
                brand: item.brand,
                image: item.image
            }
        });
    }
}

async function createItem() {
    const items = [
        {
            id: 1,
            locationId: 1,
            itemStatusId: 2,
            generalItemId: 1,
            yearBought: "2018"
        },
        {
            id: 2,
            locationId: 1,
            itemStatusId: 2,
            generalItemId: 1,
            yearBought: "2019"
        }
    ];

    for (const item of items) {
        await prisma.item.upsert({
            where: { id: item.id },
            update: {},
            create: {
                locationId: item.locationId,
                itemStatusId: item.itemStatusId,
                generalItemId: item.generalItemId,
                yearBought: new Date(item.yearBought)
            }
        });
    }
}

async function createRole() {
    const roles = [
        "Student",
        "Supervisor",
        "Manager",
        "Admin",
    ];

    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },  // This checks if the location already exists
            update: {},  // If it does, nothing is updated
            create: { name }  // If it doesn't, a new location is created
        });
    }
}

async function createRoleItem(){
    const roleItem = [
        {
            id: 1,
            roleId: 1,
            generalItemId: 1,
            
        },
        {
            id: 2,
            roleId: 2,
            generalItemId: 2,
        }
    ];

    for (const item of roleItem) {
        await prisma.roleItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
                roleId: item.roleId,
                generalItemId: item.generalItemId,
            }
        });
    }
}