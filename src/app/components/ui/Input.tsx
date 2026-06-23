import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-semibold text-text-secondary dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border border-border-app bg-bg-app px-4 py-3 text-text-primary placeholder:text-text-muted transition focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-surface-app dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-gray-500 dark:focus:border-primary-blue-light dark:focus:ring-primary-blue-light/20 ${error ? "border-danger-red focus:border-danger-red focus:ring-danger-red/20" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-danger-red">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
