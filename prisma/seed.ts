import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding database (Workspace 2)...");

    // 1. Ensure 'free' package exists
    const freePackage = await prisma.package.upsert({
        where: { slug: "free" },
        update: {},
        create: {
            name: "Free",
            slug: "free",
            displayName: "Free",
            numberOfQuestions: 50,
            price: 0,
            offerPrice: 0,
            currency: "BDT",
            duration: "monthly",
            isActive: true,
            features: {
                dragAndDrop: false,
                downloadPdf: true,
                saveQuestions: true,
            },
            limits: {
                dailyGenerations: 2,
                maxQuestionsPerSet: 20,
            },
            sortOrder: 0,
        },
    });

    console.log({ freePackage });

    // 2. Ensure 'premium' package exists
    const premiumPackage = await prisma.package.upsert({
        where: { slug: "premium" },
        update: {},
        create: {
            name: "Premium",
            slug: "premium",
            displayName: "Premium",
            numberOfQuestions: 500,
            price: 500,
            offerPrice: 300,
            currency: "BDT",
            duration: "monthly",
            isActive: true,
            features: {
                dragAndDrop: true,
                downloadPdf: true,
                saveQuestions: true,
                prioritySupport: true,
            },
            limits: {
                dailyGenerations: 50,
                maxQuestionsPerSet: 100,
            },
            sortOrder: 1,
        },
    });
    console.log({ premiumPackage });

    console.log("Seeding completed.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
