"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, Input, Field, Toggle, fieldInputStyle } from "@/components/ui";
import { Plus, Dumbbell, Check } from "@/components/icons";

const EXERCISES = [
  "Barbell Back Squat", "Bench Press", "Deadlift", "Overhead Press", "Pull-ups",
  "Romanian Deadlift", "Barbell Row", "Dumbbell Curl", "Leg Press", "Running", "Cycling", "Rowing Machine",
];

interface FormState {
  exerciseName: string;
  durationMin: number | string;
  sets: number | string;
  reps: number | string;
  weight: number | string;
  toFailure: boolean;
  intensity: number;
  caloriesBurned: number | string;
  notes: string;
}

const blank: FormState = {
  exerciseName: "",
  durationMin: 30,
  sets: 3,
  reps: 10,
  weight: 60,
  toFailure: false,
  intensity: 7,
  caloriesBurned: 180,
  notes: "",
};

export function LogExerciseButton({ block = false }: { block?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" full={block} onClick={() => setOpen(true)}>
        <Plus width={17} height={17} /> Log exercise
      </Button>
      <WorkoutModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function WorkoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setF(blank);
      setError("");
    }
  }, [open]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((p) => ({ ...p, [k]: v }));
  const rpeColor = f.intensity >= 9 ? "#ef4444" : f.intensity >= 7 ? "var(--accent)" : "var(--primary)";

  async function submit() {
    if (!f.exerciseName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseName: f.exerciseName.trim(),
          durationMinutes: f.durationMin ? Number(f.durationMin) : undefined,
          sets: f.sets ? Number(f.sets) : undefined,
          reps: f.reps ? Number(f.reps) : undefined,
          weight: f.weight !== "" ? Number(f.weight) : undefined,
          toFailure: f.toFailure,
          intensity: Number(f.intensity),
          caloriesBurned: f.caloriesBurned ? Number(f.caloriesBurned) : undefined,
          notes: f.notes,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to save workout.");
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
    <Modal open={open} onClose={onClose} title="Log exercise" width={540}>
      <div className="grid gap-[15px]">
        <Field label="Exercise">
          <Input
            list="ex-list"
            placeholder="e.g. Barbell Back Squat"
            value={f.exerciseName}
            onChange={(e) => set("exerciseName", e.target.value)}
            icon={<Dumbbell width={17} height={17} />}
            autoFocus
          />
          <datalist id="ex-list">
            {EXERCISES.map((e) => (
              <option key={e} value={e} />
            ))}
          </datalist>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Sets"><Input type="number" min="1" value={f.sets} onChange={(e) => set("sets", e.target.value)} /></Field>
          <Field label="Reps"><Input type="number" min="1" value={f.reps} onChange={(e) => set("reps", e.target.value)} /></Field>
          <Field label="Weight"><Input type="number" min="0" value={f.weight} onChange={(e) => set("weight", e.target.value)} suffix="kg" /></Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Duration"><Input type="number" min="1" value={f.durationMin} onChange={(e) => set("durationMin", e.target.value)} suffix="min" /></Field>
          <Field label="Calories burned"><Input type="number" min="0" value={f.caloriesBurned} onChange={(e) => set("caloriesBurned", e.target.value)} suffix="kcal" /></Field>
        </div>

        <Field label={`Intensity · RPE ${f.intensity}/10`}>
          <input
            type="range"
            min="1"
            max="10"
            value={f.intensity}
            onChange={(e) => set("intensity", Number(e.target.value))}
            style={{ width: "100%", accentColor: rpeColor, height: 6 }}
          />
          <div className="mt-1 flex justify-between text-[10.5px] text-muted">
            <span>Easy</span>
            <span>Moderate</span>
            <span style={{ color: "#ef4444" }}>Max effort</span>
          </div>
        </Field>

        <div className="flex items-center justify-between rounded-xl border border-border bg-[var(--bg)] px-3.5 py-3">
          <div>
            <div className="text-sm font-semibold">Trained to failure</div>
            <div className="text-xs text-muted">Last set taken to muscular failure</div>
          </div>
          <Toggle checked={f.toFailure} onChange={(v) => set("toFailure", v)} />
        </div>

        <Field label="Notes">
          <textarea
            rows={2}
            placeholder="How did it feel?"
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
            className="ct-input"
            style={{ ...fieldInputStyle, resize: "vertical" }}
          />
        </Field>

        {error && <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>}

        <div className="flex justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit} disabled={!f.exerciseName.trim() || saving}>
            <Check width={16} height={16} /> {saving ? "Saving…" : "Save exercise"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
