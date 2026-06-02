"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthChange, getCurrentUserData } from "@/lib/auth";
import type { AppUser } from "@/types";

interface AuthContextType {
  user: User | null;
  userData: AppUser | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isLoading: true,
  isAdmin: false,
  isStaff: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const data = await getCurrentUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userData?.role === "admin";
  const isStaff = userData?.role === "admin" || userData?.role === "staff";

  return (
    <AuthContext.Provider value={{ user, userData, isLoading, isAdmin, isStaff }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
