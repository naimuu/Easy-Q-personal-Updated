
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Testing simplified DB connection...");
    try {
        await prisma.$connect();
        console.log("Successfully connected to the database!");
        const userCount = await prisma.users.count();
        console.log("User count:", userCount);
    } catch (error) {
        console.error("DB Connection Failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
