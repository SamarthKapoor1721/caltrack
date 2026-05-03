"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

// ─── Types ────────────────────────────────────────
interface DataPoint {
  date: string;       // "Mon", "Tue", …
  fullDate: string;   // "YYYY-MM-DD"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface CalorieChartProps {
  data: DataPoint[];
  calorieGoal?: number;
}

// ─── Custom tooltip ───────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
  calorieGoal,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  calorieGoal?: number;
}) {
  if (!active || !payload?.length) return null;
  const cals = payload[0].value;
  const pct = calorieGoal != null ? Math.round((cals / calorieGoal) * 100) : null;

  return (
    <div className="rounded-xl border border-border-light bg-card px-4 py-3 shadow-lg">
      <p className="mb-1.5 text-xs font-semibold text-muted">{label}</p>
      <p className="text-lg font-bold tabular-nums">
        {cals.toLocaleString()}{" "}
        <span className="text-xs font-normal text-muted">kcal</span>
      </p>
      {pct != null && (
        <p className={`mt-0.5 text-xs font-semibold ${pct >= 100 ? "text-red-500" : "text-emerald-500"}`}>
          {pct}% of goal
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────
export function CalorieChart({ data, calorieGoal }: CalorieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">📊</div>
        <p className="font-medium">No calorie data yet</p>
        <p className="mt-1 text-sm text-muted">
          Log your meals to see your weekly trend.
        </p>
      </div>
    );
  }

  const maxCal = Math.max(...data.map((d) => d.calories), calorieGoal ?? 0);
  const yMax = Math.ceil(maxCal / 500) * 500 + 200;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.02} />
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
          domain={[0, yMax]}
          tick={{ fontSize: 11, fill: "var(--muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
        />

        <Tooltip content={<ChartTooltip calorieGoal={calorieGoal} />} />

        {calorieGoal != null && (
          <ReferenceLine
            y={calorieGoal}
            stroke="var(--accent)"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: `Goal ${calorieGoal.toLocaleString()}`,
              position: "insideTopRight",
              fill: "var(--accent)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        )}

        <Area
          type="monotone"
          dataKey="calories"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#calorieGrad)"
          dot={{ r: 4, fill: "var(--card)", stroke: "var(--primary)", strokeWidth: 2 }}
          activeDot={{ r: 6, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
