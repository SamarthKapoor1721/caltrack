"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button } from "@/components/ui";
import { Plus, Check } from "@/components/icons";

export function LogWeightButton({ current }: { current?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        <Plus width={17} height={17} /> Log weight
      </Button>
      <WeightModal open={open} onClose={() => setOpen(false)} current={current} />
    </>
  );
}

function WeightModal({ open, onClose, current }: { open: boolean; onClose: () => void; current?: number }) {
  const router = useRouter();
  const [weight, setWeight] = useState<string>(current != null ? String(current) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setWeight(current != null ? String(current) : "");
      setError("");
    }
  }, [open, current]);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  async function save() {
    const value = parseFloat(weight);
    if (isNaN(value) || value <= 0 || value > 700) {
      setError("Enter a valid weight between 0 and 700 kg.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/weight-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: Math.round(value * 10) / 10 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to save weight.");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Log body weight" width={420}>
      <div className="grid gap-4">
        <div className="py-2 text-center">
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            autoFocus
            placeholder="0.0"
            className="w-[180px] border-none bg-transparent text-center font-mono text-[44px] font-extrabold text-foreground outline-none"
          />
          <span className="text-lg font-semibold text-muted">kg</span>
        </div>
        <div className="text-center text-[12.5px] font-semibold text-muted">{today}</div>
        {error && <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>}
        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            <Check width={16} height={16} /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
