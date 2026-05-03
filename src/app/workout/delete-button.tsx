"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeleteWorkout({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/workout?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      onClick={onDelete}
      disabled={pending}
      aria-label="Delete workout"
      className="shrink-0 rounded-md p-1.5 text-muted hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
    >
      ✕
    </button>
  );
}
