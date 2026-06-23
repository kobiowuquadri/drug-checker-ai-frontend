"use client";

import { useAuth } from "@/app/components/auth/AuthContext";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export default function DashboardHeader({
  title,
  description,
}: DashboardHeaderProps) {
  const { user } = useAuth();
  
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-border-app dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">{title}</h1>
        {description && (
          <p className="mt-2 text-text-secondary">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-text-primary">{user?.name || "User"}</p>
          <p className="text-xs text-text-muted">{user?.email || "loading..."}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-blue text-white font-bold text-sm">
          {initials}
        </div>
      </div>
    </div>
  );
}
