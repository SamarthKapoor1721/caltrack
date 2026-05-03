"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@/components/icons";

export function DeleteFoodEntry({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!confirm("Remove this food entry?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/food-log?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // swallow — entry stays in place
    } finally {
      setDeleting(false);
    }
  }, [id, router]);

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="shrink-0 rounded-lg p-1.5 text-muted/60 transition-all hover:bg-red-500/8 hover:text-red-500 active:scale-90 disabled:opacity-40 dark:hover:bg-red-500/10"
      title="Remove entry"
    >
      <Trash className="h-4 w-4" />
    </button>
  );
}
