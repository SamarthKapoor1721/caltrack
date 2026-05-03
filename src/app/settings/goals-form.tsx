"use client";

import { useState, useTransition } from "react";
import { saveGoals } from "./actions";

export function GoalsForm({ calorieGoal }: { calorieGoal: number | null }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("idle");
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveGoals(data);
      if ("error" in result) { setStatus("error"); setMsg(result.error ?? "Error"); }
      else { setStatus("success"); setMsg("Goals saved."); }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <GoalInput label="Calories" name="calories" unit="kcal"
          defaultValue={calorieGoal ?? undefined} placeholder="e.g. 2000" />
        <GoalInput label="Protein" name="protein" unit="g" placeholder="e.g. 150" />
        <GoalInput label="Carbs" name="carbs" unit="g" placeholder="e.g. 250" />
        <GoalInput label="Fat" name="fat" unit="g" placeholder="e.g. 65" />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending}
          className="h-10 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60">
          {pending ? "Saving…" : "Save Goals"}
        </button>
        {status === "success" && <span className="text-sm text-emerald-600">✓ {msg}</span>}
        {status === "error" && <span className="text-sm text-red-600">{msg}</span>}
      </div>
    </form>
  );
}

function GoalInput({ label, name, unit, defaultValue, placeholder }: {
  label: string; name: string; unit: string; defaultValue?: number; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold">
        {label} <span className="text-xs font-normal text-muted">({unit})</span>
      </label>
      <input id={name} name={name} type="number" min="0"
        defaultValue={defaultValue} placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm transition-all placeholder:text-muted/60 hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
