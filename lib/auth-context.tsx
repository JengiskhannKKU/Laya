"use client";

import { createContext, useContext, useState, ReactNode } from "react";

import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  openAuthModal: () => void; // Keeping name for backwards compatibility, but it redirects now
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Mock login function
  const login = (email: string, pass: string) => {
    // In a real application, you would validate here vs backend/API
    console.log("Mock Login:", email);
    setUser({
      id: "mock_" + Date.now(),
      email: email,
      name: email.split("@")[0] || "User",
    });
  };

  const logout = () => {
    setUser(null);
  };

  const openAuthModal = () => router.push("/auth/login");
  const closeAuthModal = () => {}; // No-op now

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        openAuthModal,
        closeAuthModal,
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
