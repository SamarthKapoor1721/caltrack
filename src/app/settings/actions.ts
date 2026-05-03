"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/database";

export async function saveProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return { error: "Name is required." };

  await db.user.update({
    where: { id: session.user.id },
    data: { name },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

export async function saveGoals(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parse = (key: string) => {
    const v = formData.get(key);
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
  };

  const calorieGoal = parse("calories");
  if (calorieGoal == null) return { error: "Enter a valid calorie goal." };

  await db.user.update({
    where: { id: session.user.id },
    data: { calorieGoal },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}
