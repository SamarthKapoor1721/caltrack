"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────
interface WeightEntry {
  id: string;
  weight: number;
  createdAt: string; // ISO string
}

interface WeightChartProps {
  entries: WeightEntry[];
}

// ─── Helpers ──────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────
export function WeightChart({ entries }: WeightChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Sort chronologically (oldest first) and take last 30
  const data = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-30);
  }, [entries]);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 text-4xl">📊</div>
        <p className="font-medium">No weight data yet</p>
        <p className="mt-1 text-sm text-muted">
          Log your first weight entry to see your progress chart.
        </p>
      </div>
    );
  }

  // ── Chart dimensions ────────────────────────────
  const W = 600;
  const H = 260;
  const PAD_LEFT = 50;
  const PAD_RIGHT = 20;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 40;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  // ── Scales ──────────────────────────────────────
  const weights = data.map((d) => d.weight);
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);
  const rangeW = maxW - minW || 1;

  const xScale = (i: number) =>
    PAD_LEFT + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
  const yScale = (w: number) =>
    PAD_TOP + chartH - ((w - minW) / rangeW) * chartH;

  // ── Grid lines (horizontal) ─────────────────────
  const gridCount = 5;
  const gridLines = Array.from({ length: gridCount }, (_, i) => {
    const weight = minW + (rangeW / (gridCount - 1)) * i;
    return { weight: Math.round(weight * 10) / 10, y: yScale(weight) };
  });

  // ── Line path ───────────────────────────────────
  const points = data.map((d, i) => ({ x: xScale(i), y: yScale(d.weight) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // ── Gradient area path ──────────────────────────
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_TOP + chartH} L ${points[0].x} ${PAD_TOP + chartH} Z`;

  // ── X-axis labels (show ~6 evenly spaced) ───────
  const labelCount = Math.min(data.length, 6);
  const labelStep = Math.max(Math.floor((data.length - 1) / (labelCount - 1)), 1);
  const xLabels: Array<{ label: string; x: number }> = [];
  for (let i = 0; i < data.length; i += labelStep) {
    xLabels.push({ label: formatDate(data[i].createdAt), x: xScale(i) });
  }
  // Always include the last point
  if (xLabels.length > 0 && xLabels[xLabels.length - 1].x !== xScale(data.length - 1)) {
    xLabels.push({
      label: formatDate(data[data.length - 1].createdAt),
      x: xScale(data.length - 1),
    });
  }

  // ── Stats ───────────────────────────────────────
  const current = data[data.length - 1].weight;
  const oldest = data[0].weight;
  const change = Math.round((current - oldest) * 10) / 10;
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <StatPill label="Current" value={`${current}`} unit="kg" />
        <StatPill label="Min" value={`${minWeight}`} unit="kg" />
        <StatPill label="Max" value={`${maxWeight}`} unit="kg" />
        <StatPill
          label="Change"
          value={`${change > 0 ? "+" : ""}${change}`}
          unit="kg"
          color={
            change < 0
              ? "text-emerald-500"
              : change > 0
                ? "text-red-500"
                : "text-muted"
          }
        />
      </div>

      {/* SVG Chart */}
      <div className="overflow-x-auto rounded-xl border border-border-light bg-card">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ minWidth: 400 }}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((g) => (
            <g key={g.weight}>
              <line
                x1={PAD_LEFT}
                y1={g.y}
                x2={W - PAD_RIGHT}
                y2={g.y}
                stroke="var(--border)"
                strokeDasharray="4 4"
              />
              <text
                x={PAD_LEFT - 8}
                y={g.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--muted)"
              >
                {g.weight}
              </text>
            </g>
          ))}

          {/* Area fill */}
          {data.length > 1 && (
            <path d={areaPath} fill="url(#weightGrad)" />
          )}

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={data[i].id}>
              {/* Invisible hit area for hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r={12}
                fill="transparent"
                onMouseEnter={() => setHoveredIdx(i)}
                style={{ cursor: "pointer" }}
              />
              {/* Visible dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 5 : 3.5}
                fill={hoveredIdx === i ? "var(--primary)" : "var(--card)"}
                stroke="var(--primary)"
                strokeWidth={2}
                style={{ transition: "r 0.15s" }}
              />
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((l) => (
            <text
              key={l.x}
              x={l.x}
              y={H - 10}
              textAnchor="middle"
              fontSize="11"
              fill="var(--muted)"
            >
              {l.label}
            </text>
          ))}

          {/* Tooltip */}
          {hoveredIdx !== null && (
            <g>
              {/* Vertical guide line */}
              <line
                x1={points[hoveredIdx].x}
                y1={PAD_TOP}
                x2={points[hoveredIdx].x}
                y2={PAD_TOP + chartH}
                stroke="var(--primary)"
                strokeDasharray="3 3"
                opacity={0.4}
              />

              {/* Tooltip background */}
              <rect
                x={points[hoveredIdx].x - 52}
                y={points[hoveredIdx].y - 42}
                width={104}
                height={32}
                rx={8}
                fill="var(--foreground)"
                opacity={0.9}
              />
              {/* Tooltip text — weight */}
              <text
                x={points[hoveredIdx].x}
                y={points[hoveredIdx].y - 26}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="var(--card)"
              >
                {data[hoveredIdx].weight} kg
              </text>
              {/* Tooltip text — date */}
              <text
                x={points[hoveredIdx].x}
                y={points[hoveredIdx].y - 15}
                textAnchor="middle"
                fontSize="10"
                fill="var(--muted)"
              >
                {formatDateFull(data[hoveredIdx].createdAt)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Entry count hint */}
      <p className="text-center text-xs text-muted">
        Showing last {data.length} {data.length === 1 ? "entry" : "entries"}
        {entries.length > 30 && ` of ${entries.length} total`}
      </p>
    </div>
  );
}

// ─── Sub-component ───────────────────────────────
function StatPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border-light bg-background p-3">
      <span className={`text-lg font-bold tabular-nums ${color ?? ""}`}>{value}</span>
      <span className="text-[10px] font-medium text-muted">
        {unit} {label.toLowerCase()}
      </span>
    </div>
  );
}
