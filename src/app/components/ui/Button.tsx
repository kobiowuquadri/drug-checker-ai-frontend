import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-blue text-white hover:bg-primary-blue-light focus-visible:ring-primary-blue-light transition-colors",
  secondary:
    "border border-border-app bg-bg-app text-text-secondary hover:bg-surface-app hover:text-text-primary hover:border-text-secondary/35 focus-visible:ring-primary-blue transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-500",
  ghost: "text-text-secondary hover:bg-surface-app hover:text-text-primary transition-colors dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  danger: "bg-danger-red text-white hover:bg-danger-red-dark focus-visible:ring-danger-red transition-colors",
};

export default function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
