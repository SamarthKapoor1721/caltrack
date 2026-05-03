"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ─── Types ────────────────────────────────────────
interface WeightPoint {
  id: string;
  weight: number;
  date: string;     // "Mar 5"
  fullDate: string; // "Wed, Mar 5, 2026"
}

interface DashboardWeightChartProps {
  data: WeightPoint[];
}

// ─── Custom tooltip ───────────────────────────────
function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: WeightPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const pt = payload[0].payload;

  return (
    <div className="rounded-xl border border-border-light bg-card px-4 py-3 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-muted">{pt.fullDate}</p>
      <p className="text-lg font-bold tabular-nums">
        {pt.weight}{" "}
        <span className="text-xs font-normal text-muted">kg</span>
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────
export function DashboardWeightChart({ data }: DashboardWeightChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">⚖️</div>
        <p className="font-medium">No weight data yet</p>
        <p className="mt-1 text-sm text-muted">
          Log your weight to see your progress trend.
        </p>
      </div>
    );
  }

  const weights = data.map((d) => d.weight);
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="weightLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a78bfa" />
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
          tickFormatter={(v: number) => `${v}`}
          unit=" kg"
        />

        <Tooltip content={<ChartTooltip />} />

        <Line
          type="monotone"
          dataKey="weight"
          stroke="url(#weightLineGrad)"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "var(--card)", stroke: "#8b5cf6", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "#8b5cf6", stroke: "var(--card)", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
