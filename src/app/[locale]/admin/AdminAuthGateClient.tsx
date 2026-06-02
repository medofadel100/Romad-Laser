"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function AdminAuthGateClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const { user, isLoading, isAdmin, isStaff } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (typeof window === "undefined") return;

    if (!user) {
      window.location.assign(`/${locale}/auth/login`);
      return;
    }

    // For now: allow admin + staff into admin area.
    if (!isAdmin && !isStaff) {
      window.location.href = `/${locale}`;
    }
  }, [isLoading, user, isAdmin, isStaff, locale]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

