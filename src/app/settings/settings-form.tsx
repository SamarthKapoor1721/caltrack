"use client";

import { useMemo, useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Card, SectionTitle, Input, Field, Select, Avatar, Button } from "@/components/ui";
import { User, Mail, Flame, Target, Check, Logout } from "@/components/icons";
import { calculateBMR, calculateMaintenanceCalories } from "@/lib/calories";
import { saveSettings } from "./actions";

type Gender = "MALE" | "FEMALE" | "OTHER";
type Activity = "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTRA_ACTIVE";

const ACTIVITY: { value: Activity; label: string; hint: string }[] = [
  { value: "SEDENTARY", label: "Sedentary", hint: "Little / no exercise" },
  { value: "LIGHTLY_ACTIVE", label: "Lightly Active", hint: "1–3 days / week" },
  { value: "MODERATELY_ACTIVE", label: "Moderately Active", hint: "3–5 days / week" },
  { value: "VERY_ACTIVE", label: "Very Active", hint: "6–7 days / week" },
  { value: "EXTRA_ACTIVE", label: "Extra Active", hint: "Physical job + training" },
];

export interface SettingsInitial {
  name: string;
  email: string;
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  activityLevel: Activity;
  calorieGoal: number;
}

export function SettingsForm({ initial }: { initial: SettingsInitial }) {
  const [draft, setDraft] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const set = <K extends keyof SettingsInitial>(k: K, v: SettingsInitial[K]) => {
    setDraft((p) => ({ ...p, [k]: v }));
    setStatus("idle");
  };

  const bmr = useMemo(
    () => calculateBMR({ weight: +draft.weight, height: +draft.height, age: +draft.age, gender: draft.gender }),
    [draft.weight, draft.height, draft.age, draft.gender],
  );
  const maintenance = useMemo(
    () =>
      calculateMaintenanceCalories({
        weight: +draft.weight,
        height: +draft.height,
        age: +draft.age,
        gender: draft.gender,
        activityLevel: draft.activityLevel,
      }),
    [draft.weight, draft.height, draft.age, draft.gender, draft.activityLevel],
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);

  const goalPresets = [
    { label: "Lose weight", value: maintenance - 500, sub: "−500 kcal" },
    { label: "Maintain", value: maintenance, sub: "TDEE" },
    { label: "Gain muscle", value: maintenance + 350, sub: "+350 kcal" },
  ];

  function save() {
    setStatus("idle");
    startTransition(async () => {
      const result = await saveSettings({
        name: draft.name,
        age: +draft.age,
        height: +draft.height,
        weight: +draft.weight,
        gender: draft.gender,
        activityLevel: draft.activityLevel,
        calorieGoal: +draft.calorieGoal,
      });
      if ("error" in result) {
        setStatus("error");
        setMsg(result.error ?? "Error");
      } else {
        setStatus("success");
        setMsg("Saved");
      }
    });
  }

  return (
    <>
      {/* ── Profile card ── */}
      <Card glass>
        <div className="mb-5 flex items-center gap-3.5">
          <Avatar name={draft.name} size={52} />
          <div>
            <div className="text-[17px] font-bold">{draft.name || "Your name"}</div>
            <div className="text-[13px] text-muted">{draft.email}</div>
          </div>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Name"><Input value={draft.name} onChange={(e) => set("name", e.target.value)} icon={<User width={17} height={17} />} /></Field>
          <Field label="Email"><Input value={draft.email} disabled icon={<Mail width={17} height={17} />} style={{ opacity: 0.7 }} /></Field>
          <Field label="Age"><Input type="number" value={draft.age} onChange={(e) => set("age", Number(e.target.value))} suffix="yrs" /></Field>
          <Field label="Gender">
            <Select value={draft.gender} onChange={(v) => set("gender", v as Gender)} options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} />
          </Field>
          <Field label="Height"><Input type="number" value={draft.height} onChange={(e) => set("height", Number(e.target.value))} suffix="cm" /></Field>
          <Field label="Weight"><Input type="number" step="0.1" value={draft.weight} onChange={(e) => set("weight", Number(e.target.value))} suffix="kg" /></Field>
        </div>
        <Field label="Activity level" style={{ marginTop: 14 }}>
          <Select
            value={draft.activityLevel}
            onChange={(v) => set("activityLevel", v as Activity)}
            options={ACTIVITY.map((a) => ({ value: a.value, label: `${a.label} — ${a.hint}` }))}
          />
        </Field>
      </Card>

      {/* ── Calorie goal card ── */}
      <Card glass>
        <SectionTitle icon={<Target width={19} height={19} />}>Calorie goal</SectionTitle>
        <div className="mb-[18px] grid gap-3.5 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-[var(--bg)] px-[18px] py-4">
            <div className="text-xs font-semibold text-muted">BMR (Mifflin-St Jeor)</div>
            <div className="mt-1 font-mono text-[26px] font-extrabold">
              {bmr}
              <span className="text-[13px] font-medium text-muted"> kcal</span>
            </div>
          </div>
          <div className="rounded-xl px-[18px] py-4" style={{ background: "var(--primary-soft)", border: "1px solid transparent" }}>
            <div className="text-xs font-semibold" style={{ color: "var(--primary-strong)" }}>Maintenance (TDEE)</div>
            <div className="grad-text mt-1 font-mono text-[26px] font-extrabold">
              {maintenance}
              <span className="text-[13px] font-medium"> kcal</span>
            </div>
          </div>
        </div>

        <div className="mb-[18px] grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {goalPresets.map((g) => {
            const active = +draft.calorieGoal === Math.round(g.value);
            return (
              <button
                key={g.label}
                onClick={() => set("calorieGoal", Math.round(g.value))}
                className="rounded-xl px-3.5 py-3 text-left transition-all"
                style={{
                  background: active ? "var(--primary-soft)" : "var(--bg)",
                  border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
                  color: "var(--fg)",
                }}
              >
                <div className="text-sm font-bold">{g.label}</div>
                <div className="mt-1 font-mono text-[19px] font-extrabold" style={{ color: active ? "var(--primary-strong)" : "var(--fg)" }}>
                  {Math.round(g.value)}
                </div>
                <div className="mt-0.5 text-[11px] text-muted">{g.sub}</div>
              </button>
            );
          })}
        </div>
        <Field label="Custom daily target">
          <Input type="number" value={draft.calorieGoal} onChange={(e) => set("calorieGoal", Number(e.target.value))} suffix="kcal" icon={<Flame width={17} height={17} />} />
        </Field>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="danger" onClick={() => signOut({ callbackUrl: "/login" })}>
          <Logout width={16} height={16} /> Sign out
        </Button>
        <div className="flex items-center gap-3.5">
          {status === "success" && !dirty && (
            <span className="flex items-center gap-1.5 text-[13.5px] font-semibold text-primary">
              <Check width={16} height={16} /> Saved
            </span>
          )}
          {status === "error" && <span className="text-[13.5px] font-semibold text-red-500">{msg}</span>}
          <Button variant="primary" onClick={save} disabled={!dirty || pending}>
            <Check width={16} height={16} /> {pending ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </>
  );
}
