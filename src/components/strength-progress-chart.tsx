"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { ExerciseWeightHistory } from "@/services";

interface StrengthProgressChartProps {
  data: ExerciseWeightHistory[];
}

interface ChartPoint {
  date: string;     // "Jun 1"
  fullDate: string; // "Mon, Jun 1, 2026"
  weight: number;
}

function shortLabel(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function fullLabel(key: string): string {
  return new Date(`${key}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;
  return (
    <div className="rounded-xl border border-border-light bg-card px-4 py-3 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-muted">{pt.fullDate}</p>
      <p className="text-lg font-bold tabular-nums">
        {pt.weight} <span className="text-xs font-normal text-muted">kg</span>
      </p>
    </div>
  );
}

export function StrengthProgressChart({ data }: StrengthProgressChartProps) {
  const [selected, setSelected] = useState(data[0]?.exercise ?? "");

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">🏋️</div>
        <p className="font-medium">No strength data yet</p>
        <p className="mt-1 text-sm text-muted">
          Log a workout with a weight to track your progress per exercise.
        </p>
      </div>
    );
  }

  const current = data.find((d) => d.exercise === selected) ?? data[0];
  const points: ChartPoint[] = current.points.map((p) => ({
    date: shortLabel(p.date),
    fullDate: fullLabel(p.date),
    weight: p.weight,
  }));

  const weights = points.map((p) => p.weight);
  const minW = Math.max(0, Math.floor(Math.min(...weights) - 2));
  const maxW = Math.ceil(Math.max(...weights) + 2);

  const first = weights[0];
  const last = weights[weights.length - 1];
  const change = Math.round((last - first) * 10) / 10;

  return (
    <div>
      {/* Exercise picker + delta */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <select
          value={current.exercise}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-xl border border-border-light bg-background px-3 py-2 text-sm font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {data.map((d) => (
            <option key={d.exercise} value={d.exercise}>
              {d.exercise}
            </option>
          ))}
        </select>
        {points.length > 1 && (
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              change > 0
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : change < 0
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
            }`}
          >
            {change > 0 ? "+" : ""}
            {change} kg
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="strengthLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fontSize: 11, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
            unit=" kg"
          />

          <Tooltip content={<ChartTooltip />} />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="url(#strengthLineGrad)"
            strokeWidth={2.5}
            dot={{ r: 4, fill: "var(--card)", stroke: "#10b981", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#10b981", stroke: "var(--card)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
