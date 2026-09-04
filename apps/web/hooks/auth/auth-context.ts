"use client";

import {
  createContext,
  useContext,
} from "react";

import type {
  AuthMe,
  LoginData,
  RegisterData,
} from "@/types/auth";

type AuthContextType = {
  user: AuthMe | null;
  loading: boolean;

  login: (
    data: LoginData,
  ) => Promise<void>;

  register: (
    data: RegisterData,
  ) => Promise<void>;

  logout: () => Promise<void>;

  refresh: () => Promise<void>;
};

export const AuthContext =
  createContext<AuthContextType | null>(
    null,
  );

export function useAuthContext() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider.",
    );
  }

  return context;
}