"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/database";

type Gender = "MALE" | "FEMALE" | "OTHER";
type Activity = "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTRA_ACTIVE";

export async function saveSettings(data: {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  activityLevel: Activity;
  calorieGoal: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!data.name?.trim()) return { error: "Name is required." };
  if (!(data.age > 0) || !(data.height > 0) || !(data.weight > 0)) {
    return { error: "Enter valid age, height and weight." };
  }
  if (!(data.calorieGoal > 0)) return { error: "Enter a valid calorie goal." };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name.trim(),
      age: Math.round(data.age),
      height: data.height,
      weight: data.weight,
      gender: data.gender,
      activityLevel: data.activityLevel,
      calorieGoal: Math.round(data.calorieGoal),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
