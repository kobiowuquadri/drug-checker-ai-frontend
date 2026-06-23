"use client";

import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  href?: string;
  showTagline?: boolean;
  className?: string;
}

export default function Logo({ href = "/", showTagline = true, className = "" }: LogoProps) {
  const content = (
    <div className="flex flex-col">
      <div className="relative h-14 w-56">
        {/* Light theme logo: drugCheckerAi logo-black.png */}
        <Image
          src="/image/drugCheckerAi logo-black.png"
          alt="Drug Checker AI Logo"
          fill
          priority
          sizes="(max-width: 768px) 160px, 224px"
          className="object-contain object-left dark:hidden"
        />
        {/* Dark theme logo: drugCheckerAi logo.png */}
        <Image
          src="/image/drugCheckerAi.png"
          alt="Drug Checker AI Logo"
          fill
          priority
          sizes="(max-width: 768px) 160px, 224px"
          className="object-contain object-left hidden dark:block"
        />
      </div>
      {showTagline && (
        <span className="text-[10px] font-semibold tracking-wider text-text-secondary dark:text-gray-400 uppercase mt-0.5 ml-1">
          Know Before You Combine
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={`flex items-center gap-3 transition-opacity hover:opacity-90 ${className}`}>
        {content}
      </Link>
    );
  }

  return <div className={`flex items-center gap-3 ${className}`}>{content}</div>;
}
