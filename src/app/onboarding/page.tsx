"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, BrandMark, Input, Field, Select, Button } from "@/components/ui";
import { ChevronLeft, ChevronRight, Check } from "@/components/icons";
import { calculateBMR, calculateMaintenanceCalories } from "@/lib/calories";

type Gender = "MALE" | "FEMALE" | "OTHER";
type Activity = "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTRA_ACTIVE";

const ACTIVITY: { value: Activity; label: string; hint: string; mult: number }[] = [
  { value: "SEDENTARY", label: "Sedentary", hint: "Little / no exercise", mult: 1.2 },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active", hint: "1–3 days / week", mult: 1.375 },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active", hint: "3–5 days / week", mult: 1.55 },
  { value: "VERY_ACTIVE", label: "Very Active", hint: "6–7 days / week", mult: 1.725 },
  { value: "EXTRA_ACTIVE", label: "Extra Active", hint: "Physical job + training", mult: 1.9 },
];

const STEPS = [
  { title: "About you", sub: "We use this to estimate your metabolism." },
  { title: "Your body", sub: "Height and weight power the calorie math." },
  { title: "Activity level", sub: "How active are you day to day?" },
  { title: "Your goal", sub: "We'll set a daily calorie target." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    age: 28,
    gender: "MALE" as Gender,
    height: 175,
    weight: 75,
    activityLevel: "MODERATELY_ACTIVE" as Activity,
    goalType: "Maintain" as "Lose" | "Maintain" | "Gain",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof typeof p>(k: K, v: (typeof p)[K]) => setP((s) => ({ ...s, [k]: v }));

  const bmr = useMemo(() => calculateBMR({ weight: +p.weight, height: +p.height, age: +p.age, gender: p.gender }), [p.weight, p.height, p.age, p.gender]);
  const maint = useMemo(
    () => calculateMaintenanceCalories({ weight: +p.weight, height: +p.height, age: +p.age, gender: p.gender, activityLevel: p.activityLevel }),
    [p.weight, p.height, p.age, p.gender, p.activityLevel],
  );
  const goalCal = p.goalType === "Lose" ? maint - 500 : p.goalType === "Gain" ? maint + 350 : maint;

  const last = step === STEPS.length - 1;

  async function finish() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: +p.weight,
          height: +p.height,
          age: +p.age,
          gender: p.gender,
          activityLevel: p.activityLevel,
          calorieGoal: Math.round(goalCal),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--navbar-h))] flex-col items-center justify-center bg-[var(--bg)] px-5 py-8">
      <div className="w-full max-w-[460px]">
        <div className="mb-[26px] flex justify-center">
          <BrandMark />
        </div>

        {/* progress */}
        <div className="mb-7 flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-[5px] flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? "linear-gradient(90deg,var(--grad-a),var(--grad-b))" : "var(--border)" }}
            />
          ))}
        </div>

        <Card key={step} style={{ padding: 28 }}>
          <div className="anim-slide">
            <div className="text-[12.5px] font-bold uppercase tracking-[.06em] text-primary">
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="m-0 mb-1 mt-1.5 text-[23px] font-extrabold tracking-[-.02em]">{STEPS[step].title}</h2>
            <p className="m-0 mb-[22px] text-sm text-muted">{STEPS[step].sub}</p>

            {step === 0 && (
              <div className="grid gap-[15px]">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age"><Input type="number" value={p.age} onChange={(e) => set("age", Number(e.target.value))} suffix="yrs" /></Field>
                  <Field label="Gender">
                    <Select value={p.gender} onChange={(v) => set("gender", v as Gender)} options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-[18px]">
                <SliderField label="Height" value={p.height} min={140} max={210} unit="cm" onChange={(v) => set("height", v)} />
                <SliderField label="Weight" value={p.weight} min={40} max={150} step={0.5} unit="kg" onChange={(v) => set("weight", v)} />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-2.5">
                {ACTIVITY.map((a) => {
                  const active = p.activityLevel === a.value;
                  return (
                    <button
                      key={a.value}
                      onClick={() => set("activityLevel", a.value)}
                      className="flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all"
                      style={{ background: active ? "var(--primary-soft)" : "var(--bg)", border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`, color: "var(--fg)" }}
                    >
                      <div>
                        <div className="text-sm font-bold">{a.label}</div>
                        <div className="text-xs text-muted">{a.hint}</div>
                      </div>
                      <span className="font-mono text-[13px] font-bold" style={{ color: active ? "var(--primary-strong)" : "var(--muted)" }}>×{a.mult}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {([["Lose", "Lose fat"], ["Maintain", "Maintain"], ["Gain", "Build muscle"]] as const).map(([v, l]) => {
                    const active = p.goalType === v;
                    return (
                      <button
                        key={v}
                        onClick={() => set("goalType", v)}
                        className="rounded-xl px-2 py-3.5 text-[13px] font-bold transition-all"
                        style={{ background: active ? "var(--primary-soft)" : "var(--bg)", border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`, color: active ? "var(--primary-strong)" : "var(--fg)" }}
                      >
                        {l}
                      </button>
                    );
                  })}
                </div>
                <div className="rounded-2xl px-[18px] py-[22px] text-center text-white" style={{ background: "linear-gradient(150deg,var(--grad-a),var(--grad-b))" }}>
                  <div className="text-[12.5px] font-semibold opacity-90">Your daily calorie target</div>
                  <div className="font-mono text-[48px] font-extrabold leading-[1.1] tracking-[-.02em]">{Math.round(goalCal)}</div>
                  <div className="text-[12.5px] opacity-90">BMR {bmr} · Maintenance {maint} kcal</div>
                </div>
              </div>
            )}

            {error && <p className="mt-4 rounded-xl bg-red-500/8 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

            <div className="mt-6 flex gap-2.5">
              {step > 0 && (
                <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft width={16} height={16} /> Back
                </Button>
              )}
              <Button variant="primary" full onClick={() => (last ? finish() : setStep((s) => s + 1))} disabled={loading}>
                {last ? (
                  <>
                    <Check width={16} height={16} /> {loading ? "Saving…" : "Start tracking"}
                  </>
                ) : (
                  <>
                    Continue <ChevronRight width={16} height={16} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <span>
          <span className="grad-text font-mono text-[26px] font-extrabold">{value}</span>
          <span className="text-sm font-semibold text-muted"> {unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "var(--primary)", height: 6 }}
      />
    </div>
  );
}
