import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface LogoProps {
  href?: string;
  showTagline?: boolean;
}

export default function Logo({ href = "/", showTagline = true }: LogoProps) {
  const content = (
    <>
      <div className="rounded-2xl bg-emerald-100 p-2">
        <ShieldCheck className="h-6 w-6 text-emerald-600" />
      </div>
      <div>
        <p className="font-bold text-slate-900">Drug Checker AI</p>
        {showTagline && (
          <p className="text-xs text-slate-500">Know Before You Combine</p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-3">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}
