"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Scale } from "@/components/icons";

// ─── Inline icons ────────────────────────────────
function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────
export function WeightLogForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const value = parseFloat(weight);
      if (isNaN(value) || value <= 0 || value > 700) {
        setError("Enter a valid weight between 0 and 700 kg.");
        return;
      }

      setSaving(true);
      try {
        const res = await fetch("/api/weight-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weight: value }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Failed to save weight.");
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setWeight("");
          inputRef.current?.focus();
          router.refresh(); // re-fetch server data (chart + table)
        }, 1200);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [weight, router],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end gap-3">
        {/* Weight input */}
        <div className="flex-1 space-y-1.5">
          <label htmlFor="weight" className="block text-sm font-medium">
            Weight
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="700"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setError("");
                setSuccess(false);
              }}
              placeholder="e.g. 72.5"
              className="h-12 w-full rounded-xl border border-border-light bg-background pl-10 pr-12 text-sm shadow-sm transition-all placeholder:text-muted/60 hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-md"
              autoComplete="off"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted">
              kg
            </span>
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={saving || !weight}
          className="shrink-0"
        >
          {saving ? (
            <SpinnerIcon className="h-4 w-4" />
          ) : success ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            "Log Weight"
          )}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Success */}
      {success && (
        <p className="rounded-lg bg-emerald-50 p-3 text-center text-sm text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
          ✓ Weight logged successfully!
        </p>
      )}
    </form>
  );
}
