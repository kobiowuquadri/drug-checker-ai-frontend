"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import { useAuth } from "@/app/components/auth/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(email, password);
      toast.success("Logged in successfully! Welcome back.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        disabled={isSubmitting}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-text-secondary dark:text-gray-300">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-primary-blue transition hover:text-primary-blue-light hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled={isSubmitting}
          className="w-full rounded-xl border border-border-app bg-bg-app px-4 py-3 text-text-primary placeholder:text-text-muted transition focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/20 disabled:cursor-not-allowed disabled:bg-surface-app dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-gray-500 dark:focus:border-primary-blue-light dark:focus:ring-primary-blue-light/20"
        />
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting} className="relative overflow-hidden group">
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </span>
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-primary-blue transition hover:text-primary-blue-light hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
