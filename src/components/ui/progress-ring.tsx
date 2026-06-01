"use client";

import { useId } from "react";

interface ProgressRingProps {
  value: number;
  /** Goal/target value the ring fills toward. */
  max: number;
  size?: number;
  strokeWidth?: number;
  /** Small caption under the big number (e.g. "of 2500 kcal"). */
  label?: string;
}

export function ProgressRing({
  value,
  max,
  size = 196,
  strokeWidth = 16,
  label,
}: ProgressRingProps) {
  const id = useId().replace(/:/g, "");
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / (max || 1), 1);
  const offset = circ * (1 - pct);
  const overflow = value > max;
  const over = Math.round(value - max);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--grad-a)" />
            <stop offset="55%" stopColor="var(--grad-b)" />
            <stop offset="100%" stopColor="var(--grad-c)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={overflow ? "var(--accent)" : `url(#ring-${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{
            // @ts-expect-error -- custom prop consumed by the drawRing keyframe
            "--ring-circ": `${circ}px`,
            animation: "drawRing 1.1s cubic-bezier(.22,1,.36,1) both",
            transition: "stroke-dashoffset .6s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="grad-text font-extrabold leading-none"
          style={{ fontSize: size * 0.2, fontFamily: "var(--font-mono)", letterSpacing: "-.02em" }}
        >
          {Math.round(value).toLocaleString()}
        </div>
        {label && (
          <div className="mt-1.5 font-semibold text-muted" style={{ fontSize: size * 0.075 }}>
            {label}
          </div>
        )}
        {overflow && <div className="mt-1 text-[11.5px] font-bold text-accent">+{over} over</div>}
      </div>
    </div>
  );
}
