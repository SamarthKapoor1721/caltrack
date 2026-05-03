// ─── Database Seed ───
// Run with: npm run db:seed
// Populates the database with sample data for development.

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: "demo@caltrack.app" },
    update: {},
    create: {
      email: "demo@caltrack.app",
      password: "hashed_password_placeholder", // Replace with real hashing in production
      age: 28,
      height: 175,
      weight: 72,
      gender: "MALE",
      activityLevel: "MODERATELY_ACTIVE",
      calorieGoal: 2200,
    },
  });

  console.log(`  ✓ User created: ${user.email}`);

  // Create sample food logs
  const foods = [
    { foodName: "Scrambled Eggs & Toast", calories: 350, protein: 22, carbs: 28, fat: 16, mealType: "BREAKFAST" as const },
    { foodName: "Greek Yogurt with Berries", calories: 180, protein: 15, carbs: 20, fat: 4, mealType: "BREAKFAST" as const },
    { foodName: "Grilled Chicken Salad", calories: 420, protein: 38, carbs: 12, fat: 24, mealType: "LUNCH" as const },
    { foodName: "Protein Shake", calories: 220, protein: 30, carbs: 8, fat: 5, mealType: "SNACK" as const },
    { foodName: "Salmon with Veggies", calories: 520, protein: 42, carbs: 18, fat: 28, mealType: "DINNER" as const },
    { foodName: "Almonds (handful)", calories: 160, protein: 6, carbs: 6, fat: 14, mealType: "SNACK" as const },
  ];

  for (const food of foods) {
    await prisma.foodLog.create({
      data: { userId: user.id, ...food },
    });
  }

  console.log(`  ✓ ${foods.length} food logs created`);

  // Create sample weight logs
  const weights = [72.0, 71.8, 71.5, 71.9, 71.3, 71.0, 70.8];
  for (let i = 0; i < weights.length; i++) {
    await prisma.weightLog.create({
      data: {
        userId: user.id,
        weight: weights[i],
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log(`  ✓ ${weights.length} weight logs created`);
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
