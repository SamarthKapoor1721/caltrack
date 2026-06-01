"use client";

import { useState } from "react";
import { Card, Chip } from "@/components/ui";
import { Apple, Dumbbell, Bolt } from "@/components/icons";

const MEAL_COLOR: Record<string, string> = {
  BREAKFAST: "#f59e0b",
  LUNCH: "#16a34a",
  DINNER: "#6366f1",
  SNACK: "#ec4899",
};

export interface HistoryFood {
  id: string;
  foodName: string;
  calories: number;
  mealType: string;
}
export interface HistoryWorkout {
  id: string;
  exerciseName: string;
  sets: number | null;
  reps: number | null;
  weight: number | null;
  intensity: number | null;
  toFailure: boolean;
}
export interface HistoryDay {
  date: string;
  label: string;
  dayNum: number;
  calories: number;
  burned: number;
  foods: HistoryFood[];
  workouts: HistoryWorkout[];
}

type Filter = "all" | "food" | "workout";

export function HistoryTimeline({ days, today }: { days: HistoryDay[]; today: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  const options: { value: Filter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "food", label: "Food" },
    { value: "workout", label: "Workouts" },
  ];

  return (
    <div className="grid gap-[var(--gap,18px)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="m-0 text-[27px] font-extrabold tracking-tight">
            Activity <span className="grad-text">History</span>
          </h1>
          <div className="mt-1 text-[13.5px] font-semibold text-muted">{days.length} days of records</div>
        </div>
        <div className="inline-flex gap-0.5 rounded-[10px] border border-border bg-[var(--bg)] p-[3px]">
          {options.map((o) => {
            const active = o.value === filter;
            return (
              <button
                key={o.value}
                onClick={() => setFilter(o.value)}
                className="rounded-[7px] px-3.5 py-1.5 text-[13.5px] font-semibold transition-all"
                style={{
                  background: active ? "var(--card)" : "transparent",
                  color: active ? "var(--primary-strong)" : "var(--muted)",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {/* timeline rail */}
        <div className="absolute bottom-2 left-[13px] top-2 w-0.5" style={{ background: "var(--border)" }} />
        <div className="grid gap-[var(--gap,18px)]">
          {days.map((day) => {
            const showFood = filter !== "workout" && day.foods.length > 0;
            const showW = filter !== "food" && day.workouts.length > 0;
            if (!showFood && !showW) return null;
            return (
              <div key={day.date} className="flex gap-4">
                <div className="relative z-[1] flex w-7 shrink-0 flex-col items-center">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg,var(--grad-a),var(--grad-b))" }}
                  >
                    {day.dayNum}
                  </span>
                </div>
                <Card glass pad={false} className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-[18px] py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-2 text-[15px] font-bold">
                      {day.label}
                      {day.date === today && <Chip color="var(--primary)">Today</Chip>}
                    </div>
                    <div className="flex gap-3.5 font-mono text-[12.5px] font-bold">
                      {!!day.calories && <span style={{ color: "var(--primary)" }}>{day.calories} kcal in</span>}
                      {!!day.burned && <span style={{ color: "var(--accent)" }}>{day.burned} kcal out</span>}
                    </div>
                  </div>
                  <div className="px-[18px] pb-3 pt-1.5">
                    {showFood && (
                      <div className="mt-2">
                        <Label icon={<Apple width={14} height={14} />}>Food · {day.foods.length} items</Label>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {day.foods.map((f) => (
                            <span
                              key={f.id}
                              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-[var(--bg)] px-2.5 py-1 text-[12.5px]"
                            >
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: MEAL_COLOR[f.mealType] ?? "var(--muted)" }} />
                              {f.foodName} <span className="font-mono text-muted">{f.calories}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {showW && (
                      <div className="mt-3.5">
                        <Label icon={<Dumbbell width={14} height={14} />}>Workouts · {day.workouts.length} exercises</Label>
                        <div className="mt-2 grid gap-1.5">
                          {day.workouts.map((w) => (
                            <div
                              key={w.id}
                              className="flex items-center justify-between rounded-[9px] border border-border bg-[var(--bg)] px-2.5 py-1.5 text-[13px]"
                            >
                              <span className="flex items-center gap-2 font-semibold">
                                {w.exerciseName}
                                {w.toFailure && <Bolt width={13} height={13} style={{ color: "#ef4444" }} />}
                              </span>
                              <span className="font-mono text-xs text-muted">
                                {(w.sets ?? 0)}×{(w.reps ?? 0)} {w.weight ? `· ${w.weight}kg` : ""} {w.intensity ? `· RPE ${w.intensity}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Label({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide text-muted">
      {icon} {children}
    </div>
  );
}
