import { type ButtonHTMLAttributes, type CSSProperties } from "react";

type Variant = "primary" | "accent" | "soft" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Stretch to full width of the parent. */
  full?: boolean;
}

const variantStyle: Record<Variant, CSSProperties> = {
  primary: {
    background: "linear-gradient(120deg, var(--grad-a), var(--grad-b))",
    color: "#fff",
    border: "1px solid transparent",
    boxShadow: "var(--shadow-primary)",
  },
  accent: {
    background: "linear-gradient(120deg, var(--accent), color-mix(in oklab, var(--accent) 70%, #ef4444))",
    color: "#fff",
    border: "1px solid transparent",
    boxShadow: "0 8px 22px rgba(249,115,22,.28)",
  },
  soft: {
    background: "var(--primary-soft)",
    color: "var(--primary-strong)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--card)",
    color: "var(--fg)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-sm)",
  },
  ghost: {
    background: "transparent",
    color: "var(--fg)",
    border: "1px solid var(--border)",
  },
  danger: {
    background: "transparent",
    color: "#ef4444",
    border: "1px solid color-mix(in oklab,#ef4444 30%,transparent)",
  },
};

const sizeStyle: Record<Size, CSSProperties> = {
  sm: { padding: "7px 12px", fontSize: 13, gap: 6 },
  md: { padding: "10px 16px", fontSize: 14, gap: 7 },
  lg: { padding: "13px 22px", fontSize: 15, gap: 8 },
};

export function Button({
  variant = "primary",
  size = "md",
  full,
  className = "",
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`ct-btn inline-flex cursor-pointer items-center justify-center font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-55 ${className}`}
      style={{
        ...sizeStyle[size],
        ...variantStyle[variant],
        borderRadius: "var(--radius-input)",
        width: full ? "100%" : undefined,
        transition: "transform .15s ease, box-shadow .2s ease, filter .2s ease",
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
