"use client";

import { useRouter } from "next/navigation";
import { FoodSearch } from "@/components/food-search";

/**
 * Thin client wrapper that plugs `router.refresh()` into FoodSearch's
 * `onLogged` callback, so the server-rendered "Today's Log" section
 * re-fetches data after every new entry is saved.
 */
export function FoodSearchWrapper() {
  const router = useRouter();
  return <FoodSearch onLogged={() => router.refresh()} />;
}
