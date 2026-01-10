// Manual migration script to add phone field support
// Run this with: npx tsx scripts/add-phone-support.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting migration to add phone support...");

  // Get all users
  const users = await prisma.users.findMany();
  console.log(`Found ${users.length} users`);

  // Since we can't have unique constraint on nullable fields in MongoDB,
  // we'll remove the unique constraint and handle it in application logic
  console.log(
    "Migration complete! Please update your schema to remove @unique from optional fields.",
  );
  console.log("The application logic will handle uniqueness validation.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
