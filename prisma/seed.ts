// code to fill the database with dummy data
import prisma from "../src/services/db";

async function main() {
    await createLocations();
    await createItemStatus();
    await createRole();
    await createItem();
    await createRoleItem();
    await createRequestStatus();
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
        "Available",
        "Pending approval",
        "Borrowed",
        "Pending return",
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
            itemId: 1,
            
        },
        {
            id: 2,
            roleId: 2,
            itemId: 2,
        }
    ];

    for (const item of roleItem) {
        await prisma.roleItem.upsert({
            where: { id: item.id },
            update: {},
            create: {
                roleId: item.roleId,
                itemId: item.itemId,
            }
        });
    }
}

async function createItem() {
    const items = [
        {
            id: 1,
            locationId: 13,
            itemStatusId: 1,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-01",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce",
            consumable: true
        },
        {
            id: 2,
            locationId: 13,
            itemStatusId: 2,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-02",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
            id: 3,
            locationId: 13,
            itemStatusId: 3,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-03",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
            id: 4,
            locationId: 13,
            itemStatusId: 4,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-04",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
            id: 5,
            locationId: 13,
            itemStatusId: 5,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-05",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
            id: 6,
            locationId: 13,
            itemStatusId: 6,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-06",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
            id: 7,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-01",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 8,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-02",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 9,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-03",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 10,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-04",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 11,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-05",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 12,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-06",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 13,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-07",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 14,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-08",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 15,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-09",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            id: 16,
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-10",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
    ];

    for (const item of items) {
        await prisma.item.upsert({
            where: { id: item.id },
            update: {},
            create: {
                locationId: item.locationId,
                itemStatusId: item.itemStatusId,
                name: item.name,
                model: item.model,
                brand: item.brand,
                yearBought: new Date(item.yearBought),
                number: item.number,
                image: item.image
            }
        });
    }
}

async function createRequestStatus() {
    const requestStatus = [
        "Pending borrow",
        "Accepted",
        "Rejected",
        "Handed over",
        "Pending return",
        "Returned",
        "Checked",
    ];

    for (const name of requestStatus) {
        await prisma.requestStatus.upsert({
            where: { name },  // This checks if the location already exists
            update: {},  // If it does, nothing is updated
            create: { name }  // If it doesn't, a new location is created
        });
    }
}