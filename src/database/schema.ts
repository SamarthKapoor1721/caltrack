// ─── Database Schema Reference ───
// The canonical schema is defined in prisma/schema.prisma
// This file re-exports Prisma-generated types for convenience.

export type {
  User,
  FoodLog,
  WeightLog,
} from "@/generated/prisma/client";

export {
  Gender,
  ActivityLevel,
  MealType,
} from "@/generated/prisma/client";
