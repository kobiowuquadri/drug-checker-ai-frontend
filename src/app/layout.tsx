import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/app/components/auth/AuthContext";
import "./global.css";

export const metadata: Metadata = {
  title: "Drug Checker AI",
  description: "AI-powered drug interaction checker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
