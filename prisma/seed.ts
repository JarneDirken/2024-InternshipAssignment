// code to fill the database with dummy data
import prisma from "../src/services/db";

async function main() {
    await createLocations();
    await createItemStatus();
    await createRole();
    await createItem();
    await createRoleItem();
    await createRequestStatus();
    await createParameters();
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
};

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
};

async function createRole() {
    const roles = [
        "Student",
        "Teacher",
        "Supervisor",
        "Admin",
    ];

    for (const name of roles) {
        await prisma.role.upsert({
            where: { name },  // This checks if the location already exists
            update: {},  // If it does, nothing is updated
            create: { name }  // If it doesn't, a new location is created
        });
    }
};

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
        },
        {
            id: 3,
            roleId: 1,
            itemId: 3,
        },
        {
            id: 4,
            roleId: 1,
            itemId: 4,
        },
        {
            id: 5,
            roleId: 1,
            itemId: 5,
        },
        {
            id: 6,
            roleId: 1,
            itemId: 6,
        },
        {
            id: 7,
            roleId: 1,
            itemId: 7,
        },
        {
            id: 8,
            roleId: 1,
            itemId: 8,
        },
        {
            id: 9,
            roleId: 1,
            itemId: 9,
        },
        {
            id: 10,
            roleId: 1,
            itemId: 10,
        },
        {
            id: 11,
            roleId: 1,
            itemId: 11,
        },
        {
            id: 12,
            roleId: 1,
            itemId: 12,
        },
        {
            id: 13,
            roleId: 1,
            itemId: 13,
        },
        {
            id: 14,
            roleId: 1,
            itemId: 14,
        },
        {
            id: 15,
            roleId: 1,
            itemId: 15,
        },
        {
            id: 16,
            roleId: 1,
            itemId: 16,
        },
        {
            id: 17,
            roleId: 1,
            itemId: 17,
        },
        {
            id: 18,
            roleId: 1,
            itemId: 18,
        },
        {
            id: 19,
            roleId: 1,
            itemId: 19,
        },
        {
            id: 20,
            roleId: 1,
            itemId: 20,
        },
        {
            id: 21,
            roleId: 1,
            itemId: 21,
        },
        {
            id: 22,
            roleId: 1,
            itemId: 22,
        },
        {
            id: 23,
            roleId: 1,
            itemId: 23,
        },
        {
            id: 24,
            roleId: 1,
            itemId: 24,
        },
        {
            id: 25,
            roleId: 1,
            itemId: 25,
        },
        {
            id: 26,
            roleId: 1,
            itemId: 26,
        },
        {
            id: 27,
            roleId: 1,
            itemId: 27,
        },
        {
            id: 28,
            roleId: 1,
            itemId: 28,
        },

        {
            id: 29,
            roleId: 1,
            itemId: 29,
        },
        {
            id: 30,
            roleId: 1,
            itemId: 30,
        },
        {
            id: 31,
            roleId: 1,
            itemId: 31,
        },
        {
            id: 32,
            roleId: 1,
            itemId: 32,
        },
        {
            id: 33,
            roleId: 1,
            itemId: 33,
        },
        {
            id: 34,
            roleId: 1,
            itemId: 34,
        },
        {
            id: 35,
            roleId: 1,
            itemId: 35,
        },
        {
            id: 36,
            roleId: 1,
            itemId: 36,
        },
        {
            id: 37,
            roleId: 1,
            itemId: 37,
        },
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
};

async function createItem() {
    const items = [
        {
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
            locationId: 13,
            itemStatusId: 1,
            name: "Digital Multimeter UT89XD",
            model: "MULTIMETER KITS",
            brand: "UNI-T",
            yearBought: "2018",
            number: "RAI-ELEC-MUL-201-02",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fmultimeter.png?alt=media&token=25081b29-2a6e-4718-aef6-c9a61fe395ce"
        },
        {
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
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-10",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-11",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-12",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-13",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-14",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-15",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-16",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-17",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-18",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-19",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-20",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-21",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-22",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-23",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-24",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-25",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-26",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Basic Arduino Learning Kit",
            model: "COMPUTER ACCESORIES",
            brand: "ThaiEasyElec",
            yearBought: "2018",
            number: "RAI-COMP-ACES-801-27",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino.png?alt=media&token=6f1cdaca-06c9-41bc-85da-a7b9eaf6c2be"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Arduino Mega 2560 R3",
            model: "COMPUTER ACCESORIES",
            brand: "Arduino",
            yearBought: "2018",
            number: "RAI-COMP-ACES-2101-01",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino_Mega_2560_R3-removebg-preview.png?alt=media&token=e756ba4c-2e4f-4aac-aba0-5b5bfbc8593c"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "Arduino Mega 2560 R3",
            model: "COMPUTER ACCESORIES",
            brand: "Arduino",
            yearBought: "2018",
            number: "RAI-COMP-ACES-2101-02",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FArduino_Mega_2560_R3-removebg-preview.png?alt=media&token=e756ba4c-2e4f-4aac-aba0-5b5bfbc8593c"
        },
        {
            locationId: 13,
            itemStatusId: 1,
            name: "AC-DC Adapter 9V, 2A",
            model: "POWER SUPPLIES",
            brand: "Venus Supply",
            yearBought: "2018",
            number: "RAI-ELEC-POW-401-01",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2FAC-DC_Adapter_9V__2A-removebg-preview.png?alt=media&token=d4046e97-a376-433d-84c8-f99e335be33d"
        },
        {
            locationId: 10,
            itemStatusId: 1,
            name: "HDMI Cable 3m",
            model: "COMPUTER ACCESORIES",
            brand: "Unitek",
            yearBought: "2018",
            number: "RAI-COMP-ACES-106-01",
            image: "https://firebasestorage.googleapis.com/v0/b/internshipassignment-c6d15.appspot.com/o/itemPictures%2Fhdmi_cable-removebg-preview.png?alt=media&token=b547607e-29f0-4283-964c-517f07dd6a98"
        },
    ];

    for (const item of items) {
        await prisma.item.upsert({
            where: { number: item.number },
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
};

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
};

async function createParameters() {
    const parameters = [
        {
            name: "morningStartTime",
            value: "08:00",
        },
        {
            name: "morningEndTime",
            value: "09:00",
        },
        {
            name: "eveningStartTime",
            value: "17:00",
        },
        {
            name: "eveningEndTime",
            value: "18:00",
        },
    ];

    for (const item of parameters) {
        await prisma.parameter.upsert({
            where: { name: item.name },
            update: {},
            create: {
                name: item.name,
                value: item.value,
            }
        });
    }
};