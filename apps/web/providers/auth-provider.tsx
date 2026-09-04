"use client";

import {
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { AuthContext } from "@/hooks/auth/auth-context";
import {
  useLogin,
  useLogout,
  useRegister,
} from "@/hooks/mutations/use-auth";

import { authService } from "@/services/auth/auth.service";

import type {
  AuthMe,
  LoginData,
  RegisterData,
} from "@/types/auth";

export function AuthProvider({
  children,
}: PropsWithChildren) {
  const [user, setUser] =
    useState<AuthMe | null>(null);

  const [loading, setLoading] =
    useState(true);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const auth = localStorage.getItem("auth");

    if (!auth) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authService.me();

      setUser(data);
    } catch {
      localStorage.removeItem("auth");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(
    data: LoginData,
  ) {
    const response =
      await loginMutation.mutateAsync(data);

    setUser({
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
    });
  }

  async function register(
    data: RegisterData,
  ) {
    const response =
      await registerMutation.mutateAsync(data);

    setUser({
      id: response.user.id,
      email: response.user.email,
      role: response.user.role,
    });
  }

  async function logout() {
    await logoutMutation.mutateAsync();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}