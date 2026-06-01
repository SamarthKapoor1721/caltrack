import { type InputHTMLAttributes, type ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Leading icon (absolutely positioned inside the field). */
  icon?: ReactNode;
  /** Trailing suffix text (e.g. "kg", "kcal"). */
  suffix?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  icon,
  suffix,
  className = "",
  id,
  style,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[12.5px] font-semibold text-muted">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 flex text-muted">{icon}</span>}
        <input
          id={id}
          className={`ct-input w-full rounded-[var(--radius-input)] border bg-[var(--bg)] text-[14.5px] text-foreground outline-none transition-all placeholder:text-muted/60 ${
            error ? "border-red-400" : "border-border hover:border-border"
          } ${className}`}
          style={{
            padding: "11px 13px",
            paddingLeft: icon ? 38 : 13,
            paddingRight: suffix ? 44 : 13,
            ...style,
          }}
          {...props}
        />
        {suffix && <span className="absolute right-3.5 text-[13px] font-semibold text-muted">{suffix}</span>}
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
