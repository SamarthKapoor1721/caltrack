"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame } from "@/components/icons";
import {
  calculateMaintenanceCalories,
  type GenderValue,
  type ActivityLevelValue,
} from "@/lib/calories";

// ─── Constants ────────────────────────────────────
const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

const ACTIVITY_LEVELS = [
  { value: "SEDENTARY", label: "Sedentary", description: "Little or no exercise" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "VERY_ACTIVE", label: "Very Active", description: "Hard exercise 6-7 days/week" },
  { value: "EXTRA_ACTIVE", label: "Extra Active", description: "Very hard exercise & physical job" },
] as const;

// ─── Client-side TDEE preview using shared calculation ─────
function previewTDEE(
  weight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: string,
): number | null {
  if (!weight || !height || !age || !gender || !activityLevel) return null;
  return calculateMaintenanceCalories({
    weight,
    height,
    age,
    gender: gender as GenderValue,
    activityLevel: activityLevel as ActivityLevelValue,
  });
}

// ─── Page Component ───────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [activityLevel, setActivityLevel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Live TDEE preview
  const estimatedCalories = useMemo(
    () =>
      previewTDEE(
        parseFloat(weight),
        parseFloat(height),
        parseInt(age, 10),
        gender,
        activityLevel,
      ),
    [weight, height, age, gender, activityLevel],
  );

  const isFormValid =
    weight && height && age && gender && activityLevel && estimatedCalories;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(weight),
          height: parseFloat(height),
          age: parseInt(age, 10),
          gender,
          activityLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Profile saved — go to dashboard
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center px-4 py-12">
      <Card className="w-full animate-scale-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Flame className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Let&apos;s set up your profile
          </h1>
          <p className="mt-1 text-sm text-muted">
            We&apos;ll calculate your daily calorie goal using the
            Mifflin-St&nbsp;Jeor equation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weight & Height */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="weight"
              label="Weight (kg)"
              type="number"
              step="0.1"
              min="1"
              max="500"
              placeholder="70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
            <Input
              id="height"
              label="Height (cm)"
              type="number"
              step="0.1"
              min="1"
              max="300"
              placeholder="175"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              required
            />
          </div>

          {/* Age */}
          <Input
            id="age"
            label="Age"
            type="number"
            min="1"
            max="150"
            placeholder="25"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />

          {/* Gender */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Gender</label>
            <div className="grid grid-cols-3 gap-3">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    gender === g.value
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border-light bg-card text-foreground hover:border-border hover:bg-primary/5"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map((al) => (
                <button
                  key={al.value}
                  type="button"
                  onClick={() => setActivityLevel(al.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                    activityLevel === al.value
                      ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                      : "border-border-light bg-card hover:border-border hover:bg-primary/5"
                  }`}
                >
                  <span className="text-sm font-semibold">{al.label}</span>
                  <span className="ml-2 text-xs text-muted">
                    {al.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* TDEE Preview */}
          {estimatedCalories && estimatedCalories > 0 && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center animate-scale-in">
              <p className="text-sm font-medium text-muted">
                Estimated daily calorie goal
              </p>
              <p className="mt-1 text-4xl font-bold text-primary tabular-nums">
                {estimatedCalories.toLocaleString()}{" "}
                <span className="text-base font-normal text-muted">kcal</span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="rounded-xl bg-red-500/8 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isFormValid || loading}
          >
            {loading ? "Saving…" : "Save & Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
