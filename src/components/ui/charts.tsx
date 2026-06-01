"use client";

import { useId, useState } from "react";

/* ---------- Horizontal progress bar ---------- */
export function ProgressBar({
  value,
  goal,
  color = "var(--primary)",
  height = 10,
}: {
  value: number;
  goal: number;
  color?: string;
  height?: number;
}) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  const over = value > goal;
  return (
    <div style={{ width: "100%", height, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          borderRadius: 999,
          background: over
            ? "var(--accent)"
            : `linear-gradient(90deg, ${color}, color-mix(in oklab, ${color} 60%, var(--grad-c)))`,
          transition: "width .7s cubic-bezier(.22,1,.36,1)",
        }}
      />
    </div>
  );
}

/* ---------- Big consumed-vs-goal bar ---------- */
export function CalorieBar({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min((value / (goal || 1)) * 100, 100);
  const over = value > goal;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <div>
          <span className="grad-text" style={{ fontSize: 46, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-.02em" }}>
            {Math.round(value)}
          </span>
          <span style={{ fontSize: 18, color: "var(--muted)", fontWeight: 600 }}> / {goal}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: over ? "var(--accent)" : "var(--primary)" }}>
          {over ? `+${Math.round(value - goal)} over` : `${Math.round(goal - value)} left`}
        </span>
      </div>
      <div style={{ height: 18, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: 999,
            background: over ? "linear-gradient(90deg,var(--accent),#ef4444)" : "linear-gradient(90deg,var(--grad-a),var(--grad-c))",
            transition: "width .7s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </div>
    </div>
  );
}

/* ---------- Donut (macros) ---------- */
export function DonutChart({
  data,
  size = 150,
  stroke = 22,
  centerTop,
  centerBottom,
}: {
  data: { value: number; color: string }[];
  size?: number;
  stroke?: number;
  centerTop?: string;
  centerBottom?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  // Precompute each segment's dash length + starting offset (no mutation during render).
  const segments = data.reduce<{ color: string; dash: number; offset: number }[]>((segs, d) => {
    const prevEnd = segs.length ? segs[segs.length - 1].offset + segs[segs.length - 1].dash : 0;
    segs.push({ color: d.color, dash: circ * (d.value / total), offset: prevEnd });
    return segs;
  }, []);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
            style={{ transition: "stroke-dasharray .7s ease, stroke-dashoffset .7s ease" }}
          />
        ))}
      </svg>
      {(centerTop || centerBottom) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: size * 0.18, fontWeight: 800, fontFamily: "var(--font-mono)" }}>{centerTop}</div>
          <div style={{ fontSize: size * 0.08, color: "var(--muted)", fontWeight: 600 }}>{centerBottom}</div>
        </div>
      )}
    </div>
  );
}

export interface ChartPoint {
  value: number;
  label: string;
}

const PAD = { l: 42, r: 14, t: 18, b: 28 };

/* ---------- Line / area chart ---------- */
export function LineChart({
  data,
  w = 560,
  h = 220,
  color = "var(--primary)",
  area = true,
  unit = "",
  dots = true,
  smooth = true,
}: {
  data: ChartPoint[];
  w?: number;
  h?: number;
  color?: string;
  area?: boolean;
  unit?: string;
  dots?: boolean;
  smooth?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  if (!data || data.length === 0) {
    return <EmptyChart label="No data yet" />;
  }
  const ys = data.map((d) => d.value);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const padY = (maxY - minY) * 0.18 || 1;
  const lo = minY - padY;
  const hi = maxY + padY;
  const iw = w - PAD.l - PAD.r;
  const ih = h - PAD.t - PAD.b;
  const X = (i: number) => PAD.l + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const Y = (v: number) => PAD.t + ih - ((v - lo) / (hi - lo || 1)) * ih;

  const pts = data.map((d, i) => [X(i), Y(d.value)] as [number, number]);
  function pathFrom(points: [number, number][]) {
    if (points.length < 2) return `M ${points[0][0]} ${points[0][1]}`;
    if (!smooth) return "M " + points.map((p) => p.join(" ")).join(" L ");
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
    }
    return d;
  }
  const line = pathFrom(pts);
  const areaPath = `${line} L ${X(data.length - 1)} ${PAD.t + ih} L ${X(0)} ${PAD.t + ih} Z`;
  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => lo + ((hi - lo) * i) / ticks);

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        style={{ display: "block", overflow: "visible" }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * w;
          let best = 0;
          let bd = 1e9;
          data.forEach((_, i) => {
            const dd = Math.abs(X(i) - x);
            if (dd < bd) {
              bd = dd;
              best = i;
            }
          });
          setHover(best);
        }}
      >
        <defs>
          <linearGradient id={`lc-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridVals.map((gv, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={w - PAD.r} y1={Y(gv)} y2={Y(gv)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
            <text x={PAD.l - 8} y={Y(gv) + 3.5} textAnchor="end" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
              {hi - lo < 12 ? gv.toFixed(1) : Math.round(gv)}
            </text>
          </g>
        ))}
        {area && <path d={areaPath} fill={`url(#lc-${id})`} className="anim-fade" />}
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 4px 8px color-mix(in oklab, var(--primary) 30%, transparent))" }}
        />
        {dots &&
          pts.map((p, i) => (
            <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 5.5 : 3.2} fill="var(--card)" stroke={color} strokeWidth="2.4" style={{ transition: "r .15s ease" }} />
          ))}
        {data.map((d, i) => (
          <text key={i} x={X(i)} y={h - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
            {d.label}
          </text>
        ))}
        {hover != null && <line x1={X(hover)} x2={X(hover)} y1={PAD.t} y2={PAD.t + ih} stroke={color} strokeWidth="1" opacity="0.4" />}
      </svg>
      {hover != null && (
        <div
          style={{
            position: "absolute",
            left: `${(X(hover) / w) * 100}%`,
            top: 0,
            transform: "translate(-50%,-8px)",
            background: "var(--fg)",
            color: "var(--bg)",
            padding: "5px 9px",
            borderRadius: 8,
            fontSize: 11.5,
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {data[hover].value}
          {unit} <span style={{ opacity: 0.65, fontWeight: 500 }}>· {data[hover].label}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Bar chart ---------- */
export function BarChart({
  data,
  w = 560,
  h = 220,
  color = "var(--accent)",
  unit = "",
  goalLine,
}: {
  data: ChartPoint[];
  w?: number;
  h?: number;
  color?: string;
  unit?: string;
  goalLine?: number;
}) {
  const id = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);
  if (!data || !data.length) return <EmptyChart label="No data yet" />;
  const ys = data.map((d) => d.value);
  const maxY = Math.max(...ys, goalLine || 0) * 1.15 || 1;
  const iw = w - PAD.l - PAD.r;
  const ih = h - PAD.t - PAD.b;
  const bw = (iw / data.length) * 0.56;
  const X = (i: number) => PAD.l + (i + 0.5) * (iw / data.length);
  const Y = (v: number) => PAD.t + ih - (v / maxY) * ih;
  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => (maxY * i) / ticks);
  return (
    <div style={{ width: "100%", position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`bc-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {gridVals.map((gv, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={w - PAD.r} y1={Y(gv)} y2={Y(gv)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 5" opacity="0.7" />
            <text x={PAD.l - 8} y={Y(gv) + 3.5} textAnchor="end" fontSize="10.5" fill="var(--muted)" fontFamily="var(--font-mono)">
              {Math.round(gv)}
            </text>
          </g>
        ))}
        {goalLine && (
          <g>
            <line x1={PAD.l} x2={w - PAD.r} y1={Y(goalLine)} y2={Y(goalLine)} stroke="var(--primary)" strokeWidth="1.6" strokeDasharray="5 4" />
            <text x={w - PAD.r} y={Y(goalLine) - 5} textAnchor="end" fontSize="10" fill="var(--primary)" fontWeight="700">
              goal
            </text>
          </g>
        )}
        {data.map((d, i) => {
          const bh = Math.max(ih - (Y(d.value) - PAD.t), 2);
          return (
            <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: "pointer" }}>
              <rect
                x={X(i) - bw / 2}
                y={Y(d.value)}
                width={bw}
                height={bh}
                rx={6}
                fill={`url(#bc-${id})`}
                opacity={hover == null || hover === i ? 1 : 0.45}
                style={{
                  transformOrigin: `${X(i)}px ${PAD.t + ih}px`,
                  animation: `growBar .7s cubic-bezier(.22,1,.36,1) both`,
                  animationDelay: `${i * 0.05}s`,
                  transition: "opacity .15s",
                }}
              />
              <text x={X(i)} y={h - 8} textAnchor="middle" fontSize="10.5" fill="var(--muted)">
                {d.label}
              </text>
              {hover === i && (
                <text x={X(i)} y={Y(d.value) - 7} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--fg)">
                  {d.value}
                  {unit}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-44 items-center justify-center text-sm text-muted">{label}</div>
  );
}
