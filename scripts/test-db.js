
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Testing DB connection (JS)...");
    try {
        await prisma.$connect();
        console.log("Connected to DB!");
        const count = await prisma.users.count();
        console.log("User count:", count);
    } catch (e) {
        console.error("Connection failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
