"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const RPE_LABELS: Record<number, string> = {
  1: "Very Easy", 2: "Easy", 3: "Moderate", 4: "Somewhat Hard", 5: "Hard",
  6: "Hard+", 7: "Very Hard", 8: "Extremely Hard", 9: "Near Max", 10: "Max Effort",
};

export function WorkoutForm() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);

  const [exerciseName, setExerciseName] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [toFailure, setToFailure] = useState(false);
  const [intensity, setIntensity] = useState<number | null>(null);
  const [calories, setCalories] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const q = exerciseName.trim();
    if (q.length < 2) { setSuggestions([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/workout?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setSuggestions(Array.isArray(data.results) ? data.results : []);
      } catch { /* ignore */ }
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [exerciseName]);

  const reset = useCallback(() => {
    setExerciseName(""); setDuration(""); setSets(""); setReps("");
    setToFailure(false); setIntensity(null); setCalories(""); setNotes("");
    setSuggestions([]);
    nameRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!exerciseName.trim()) { setError("Enter an exercise name."); return; }
    if (!duration && !sets) { setError("Enter at least a duration or number of sets."); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseName: exerciseName.trim(),
          durationMinutes: duration ? Number(duration) : undefined,
          sets: sets ? Number(sets) : undefined,
          reps: reps ? Number(reps) : undefined,
          toFailure,
          intensity,
          caloriesBurned: calories ? Number(calories) : undefined,
          notes,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to save workout.");
        return;
      }

      reset();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [exerciseName, duration, sets, reps, toFailure, intensity, calories, notes, router, reset]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Exercise name + autocomplete */}
      <div className="relative space-y-1">
        <label className="block text-sm font-medium">Exercise</label>
        <input
          ref={nameRef}
          value={exerciseName}
          onChange={(e) => { setExerciseName(e.target.value); setShowSuggestions(true); setError(""); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="e.g. Bench Press, Running, Squat"
          autoComplete="off"
          className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-border-light bg-card shadow-lg">
            {suggestions.map((s) => (
              <li key={s.name}>
                <button type="button"
                  onMouseDown={(e) => { e.preventDefault(); setExerciseName(s.name); setSuggestions([]); setShowSuggestions(false); }}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-primary/8">
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sets × Reps */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Sets</label>
          <input value={sets} onChange={(e) => setSets(e.target.value)} type="number" min="1" max="100" placeholder="e.g. 4"
            className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Reps</label>
          <input value={reps} onChange={(e) => setReps(e.target.value)} type="number" min="1" placeholder="e.g. 10"
            className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm" />
        </div>
      </div>

      {/* To failure toggle */}
      <button type="button" onClick={() => setToFailure((v) => !v)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${
          toFailure
            ? "border-red-400 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
            : "border-border-light bg-background text-muted hover:border-border"
        }`}>
        <span className="font-medium">Trained to Failure</span>
        <span className={`h-5 w-9 rounded-full transition-colors ${toFailure ? "bg-red-500" : "bg-muted/30"} relative`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${toFailure ? "translate-x-4" : "translate-x-0.5"}`} />
        </span>
      </button>

      {/* Intensity (RPE 1–10) */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">Intensity (RPE)</label>
          {intensity != null
            ? <span className="text-xs font-semibold text-primary">{intensity}/10 — {RPE_LABELS[intensity]}</span>
            : <span className="text-xs text-muted">optional</span>}
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button"
              onClick={() => setIntensity(intensity === n ? null : n)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                intensity != null && n <= intensity
                  ? n <= 4 ? "bg-emerald-500 text-white"
                  : n <= 7 ? "bg-amber-500 text-white"
                  : "bg-red-500 text-white"
                  : "bg-muted/15 text-muted hover:bg-muted/30"
              }`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Duration + Calories */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Duration (min)</label>
          <input value={duration} onChange={(e) => setDuration(e.target.value)} type="number" min="1" placeholder="e.g. 45"
            className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium">Calories burned</label>
          <input value={calories} onChange={(e) => setCalories(e.target.value)} type="number" min="0" placeholder="optional"
            className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium">Notes</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes"
          className="h-12 w-full rounded-xl border border-border-light bg-background px-4 text-sm shadow-sm" />
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving || !exerciseName.trim()}>
          {saving ? "Saving…" : "Log Workout"}
        </Button>
      </div>
    </form>
  );
}
