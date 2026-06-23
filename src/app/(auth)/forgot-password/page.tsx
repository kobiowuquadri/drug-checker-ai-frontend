"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import AuthCard from "@/app/components/auth/AuthCard";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    toast.success("Demo mode: password reset link sent to " + email);
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link."
    >
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

        <Button type="submit" fullWidth disabled={isSubmitting}>
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </span>
        </Button>

        <p className="text-center text-sm text-text-secondary">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-bold text-primary-blue transition hover:text-primary-blue-light hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
