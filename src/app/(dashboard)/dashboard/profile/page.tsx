"use client";

import Image from "next/image";
import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { useAuth } from "@/app/components/auth/AuthContext";

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();

  return (
    <div>
      <DashboardHeader title="Profile and account" description="Review your secure account profile and session settings." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-8 text-center">
          <div className="mx-auto h-28 w-28 overflow-hidden rounded-[32px] shadow-soft ring-4 ring-primary-blue/10">
            <Image
              src="/image/rian-ramirez-rm7rZYdl3rY-unsplash.jpg"
              alt="Profile photo"
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          </div>
          <h2 className="mt-5 text-2xl font-black">{user?.name || "User"}</h2>
          <p className="mt-1 text-sm font-medium text-text-secondary">{user?.email || "Loading profile..."}</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-medical-green/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-medical-green">
            <ShieldCheck className="h-4 w-4" />
            Cookie-secured session
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-black">Profile information</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-border-app bg-surface-app p-4">
                <UserRound className="h-5 w-5 text-primary-blue" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-text-muted">Full name</p>
                <p className="mt-1 text-sm font-black text-text-primary">{user?.name || "Not available"}</p>
              </div>
              <div className="rounded-3xl border border-border-app bg-surface-app p-4">
                <Mail className="h-5 w-5 text-primary-blue" />
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-text-muted">Email address</p>
                <p className="mt-1 text-sm font-black text-text-primary">{user?.email || "Not available"}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={refreshUser}>Refresh profile</Button>
              <Button variant="danger" onClick={logout}><LogOut className="h-4 w-4" /> Sign out</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-black">Account settings</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-text-secondary">
              Profile editing, password changes, and email verification are prepared in the UI roadmap. The current backend exposes read-only profile data plus cookie-based authentication endpoints.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
