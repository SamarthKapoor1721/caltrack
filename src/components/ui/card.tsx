import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className = "", hover = false, style }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-light bg-card p-6 shadow-sm transition-all duration-200 ${
        hover ? "hover:shadow-md hover:border-border hover:-translate-y-0.5 cursor-pointer" : ""
      } ${className}`}
      style={style}
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
    <div className="mb-5 flex items-start justify-between">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
