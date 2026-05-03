import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`h-11 w-full rounded-xl border bg-card px-4 text-sm shadow-sm transition-all duration-150 placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-md ${
          error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-border-light hover:border-border"
        } ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
