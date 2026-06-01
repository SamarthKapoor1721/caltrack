import { type CSSProperties, type ReactNode } from "react";
import { Flame, ChevronRight } from "@/components/icons";

/* ---------------- Brand mark ---------------- */
export function BrandMark({ light = false, size = "md" }: { light?: boolean; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? 38 : size === "sm" ? 30 : 34;
  const text = size === "lg" ? 20 : size === "sm" ? 16 : 18;
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex items-center justify-center text-white"
        style={{
          width: dims,
          height: dims,
          borderRadius: 11,
          background: light ? "rgba(255,255,255,.18)" : "linear-gradient(135deg,var(--grad-a),var(--grad-b))",
        }}
      >
        <Flame style={{ width: dims * 0.55, height: dims * 0.55 }} />
      </span>
      <span style={{ fontWeight: 800, fontSize: text, letterSpacing: "-.02em", color: light ? "#fff" : "var(--fg)" }}>
        CalTrack
      </span>
    </div>
  );
}

/* ---------------- Chip ---------------- */
export function Chip({
  children,
  color = "var(--muted)",
  bg,
  icon,
  style,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  icon?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color,
        background: bg || "color-mix(in oklab, currentColor 12%, transparent)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  const initials = (name || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center text-white"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--grad-a), var(--grad-b))",
        fontWeight: 700,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </span>
  );
}

/* ---------------- Stat card ---------------- */
export function StatCard({
  icon,
  color,
  label,
  value,
  unit,
  trend,
  trendGood,
}: {
  icon: ReactNode;
  color: string;
  label: string;
  value: ReactNode;
  unit?: string;
  trend?: string;
  trendGood?: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-md)",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          className="flex items-center justify-center"
          style={{ width: 40, height: 40, borderRadius: 11, background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
        >
          {icon}
        </span>
        {trend && (
          <Chip color={trendGood ? "var(--primary)" : "var(--accent)"}>{trend}</Chip>
        )}
      </div>
      <div style={{ marginTop: 16, fontSize: 26, fontWeight: 800, fontFamily: "var(--font-mono)", letterSpacing: "-.02em" }}>
        {value}
        {unit && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500, marginLeft: 4 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

/* ---------------- Key-value row (icon + label + value) ---------------- */
export function KV({
  icon,
  color,
  label,
  value,
  unit,
}: {
  icon: ReactNode;
  color: string;
  label: string;
  value: ReactNode;
  unit?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <span
        className="flex shrink-0 items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: 10, background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
      >
        {icon}
      </span>
      <div>
        <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-mono)" }}>
          {value} {unit && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{unit}</span>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Metric tile (workout cards / search confirm) ---------------- */
export function Metric({
  label,
  value,
  unit,
  color = "var(--fg)",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  color?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "12px 6px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 800, fontSize: 18, color }}>
        {value}
        {unit && <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center", padding: "36px 20px", color: "var(--muted)" }}>
      <div
        className="mx-auto flex items-center justify-center"
        style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 14, background: "var(--bg)", color: "var(--muted)" }}
      >
        {icon}
      </div>
      <div style={{ fontWeight: 700, color: "var(--fg)", fontSize: 15, marginBottom: 4 }}>{title}</div>
      {hint && <div style={{ fontSize: 13.5, maxWidth: 280, margin: "0 auto 14px" }}>{hint}</div>}
      {action}
    </div>
  );
}

/* ---------------- Form field wrapper ---------------- */
export function Field({
  label,
  hint,
  children,
  style,
}: {
  label?: string;
  hint?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <label style={{ display: "block", ...style }}>
      {label && (
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 7, letterSpacing: ".01em" }}>{label}</div>
      )}
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>{hint}</div>}
    </label>
  );
}

export const fieldInputStyle: CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  fontSize: 14.5,
  fontFamily: "var(--font-sans)",
  background: "var(--bg)",
  color: "var(--fg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-input)",
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
};

/* ---------------- Select ---------------- */
export function Select({
  value,
  onChange,
  options,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ({ value: string; label: string } | string)[];
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ct-input"
        style={{ ...fieldInputStyle, appearance: "none", paddingRight: 36, cursor: "pointer", ...style }}
      >
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          const l = typeof o === "string" ? o : o.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%) rotate(90deg)", color: "var(--muted)", pointerEvents: "none", display: "flex" }}>
        <ChevronRight width={15} height={15} />
      </span>
    </div>
  );
}

/* ---------------- Toggle ---------------- */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--fg)" }}
    >
      <span
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          padding: 3,
          transition: "background .2s ease",
          background: checked ? "linear-gradient(120deg,var(--grad-a),var(--grad-b))" : "var(--border)",
          display: "inline-flex",
        }}
      >
        <span
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "var(--shadow-sm)",
            transform: checked ? "translateX(18px)" : "translateX(0)",
            transition: "transform .2s cubic-bezier(.22,1,.36,1)",
          }}
        />
      </span>
      {label && <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>}
    </button>
  );
}

/* ---------------- Icon button ---------------- */
export function IconButton({
  icon,
  onClick,
  label,
  danger,
  style,
}: {
  icon: ReactNode;
  onClick?: () => void;
  label: string;
  danger?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="ct-iconbtn inline-flex items-center justify-center"
      style={{
        width: 34,
        height: 34,
        borderRadius: 9,
        cursor: "pointer",
        background: "transparent",
        border: "1px solid var(--border)",
        color: danger ? "#ef4444" : "var(--muted)",
        transition: "all .15s ease",
        ...style,
      }}
    >
      {icon}
    </button>
  );
}
