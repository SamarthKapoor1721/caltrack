import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Frosted-glass background. */
  glass?: boolean;
  /** Lift + shadow on hover (use for clickable cards). */
  hover?: boolean;
  /** Apply default padding (set false for edge-to-edge lists). */
  pad?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({
  children,
  className = "",
  glass = false,
  hover = false,
  pad = true,
  style,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`${glass ? "glass" : ""} ${hover ? "ct-card-hover cursor-pointer" : ""} ${className}`}
      style={{
        background: glass ? "var(--card-glass)" : "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-md)",
        padding: pad ? "var(--pad, 20px)" : 0,
        transition: "box-shadow .2s ease, transform .2s ease, border-color .2s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-bold tracking-tight">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Compact section heading with a primary-tinted leading icon. */
export function SectionTitle({
  children,
  icon,
  action,
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between">
      <h2 className="m-0 flex items-center gap-2.5 text-[17px] font-bold">
        {icon && <span className="flex text-primary">{icon}</span>}
        {children}
      </h2>
      {action}
    </div>
  );
}
