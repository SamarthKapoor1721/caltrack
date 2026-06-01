"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@/components/icons";

export function DeleteWorkout({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    if (!confirm("Delete this workout?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/workout?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  };

  return (
    <button
      onClick={onDelete}
      disabled={pending}
      aria-label="Delete workout"
      title="Delete workout"
      className="ct-iconbtn inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] border border-border text-red-500 transition-all disabled:opacity-50"
    >
      <Trash width={18} height={18} />
    </button>
  );
}
