
import prisma from "../src/config/prisma";

async function main() {
    console.log("Testing DB connection...");
    try {
        const userCount = await prisma.users.count();
        console.log("DB Connection Successful! User count:", userCount);
    } catch (error) {
        console.error("DB Connection Failed!", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
