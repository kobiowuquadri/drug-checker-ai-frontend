import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link href="/" className="mt-8 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
