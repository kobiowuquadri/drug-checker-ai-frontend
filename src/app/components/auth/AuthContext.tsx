"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export interface User {
  id?: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get authorization headers + standard headers
export function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

// Deep extractor helper for user and token
function extractUserFromResponse(data: any): User | null {
  if (!data) return null;
  
  // Try to find object that has 'email' and 'name'
  const targets = [
    data,
    data.user,
    data.data,
    data.data?.user
  ];

  for (const t of targets) {
    if (t && typeof t === "object" && typeof t.email === "string") {
      return {
        id: t.id || t._id,
        name: t.name || t.fullName || "User",
        email: t.email,
      };
    }
  }
  return null;
}

function extractTokenFromResponse(data: any): string | null {
  if (!data) return null;
  return data.token || data.accessToken || data.data?.token || data.data?.accessToken || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user profile on mount
  const refreshUser = async () => {
    try {
      const response = await fetch("/users/profile", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        const extractedUser = extractUserFromResponse(data);
        if (extractedUser) {
          setUser(extractedUser);
        } else {
          // If response is OK but we couldn't parse the user structure, default it
          setUser({ name: "Authenticated User", email: "user@example.com" });
        }
      } else {
        // If profile fetch fails, assume session expired or invalid token
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
        }
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // Handle route guarding
  useEffect(() => {
    if (isLoading) return;

    const isAuthRoute = ["/login", "/register", "/forgot-password"].includes(pathname);
    const isDashboardRoute = pathname.startsWith("/dashboard");

    if (user && isAuthRoute) {
      router.replace("/dashboard");
    } else if (!user && isDashboardRoute) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  // Login handler
  const login = async (email: string, password: string) => {
    const response = await fetch("/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Login failed. Please try again.");
    }

    const token = extractTokenFromResponse(data);
    if (token) {
      localStorage.setItem("auth_token", token);
    }

    // Attempt to parse user from login response, fallback to fetching /users/profile
    const loggedInUser = extractUserFromResponse(data);
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      await refreshUser();
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    const response = await fetch("/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Registration failed. Please try again.");
    }

    const token = extractTokenFromResponse(data);
    if (token) {
      localStorage.setItem("auth_token", token);
    }

    const registeredUser = extractUserFromResponse(data);
    if (registeredUser) {
      setUser(registeredUser);
    } else {
      await refreshUser();
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await fetch("/users/logout", {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
      }
      toast.success("Signed out successfully.");
      router.push("/login");
    }
  };

  const isAuthenticated = !!user;

  // Render a loading state during first check for protected routes to avoid flashing content
  const isDashboardRoute = pathname.startsWith("/dashboard");
  if (isLoading && isDashboardRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-app transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-blue border-t-transparent" />
          <p className="text-sm font-semibold text-text-secondary">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
