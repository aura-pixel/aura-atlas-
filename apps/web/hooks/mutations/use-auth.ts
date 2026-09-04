"use client";

import { useMutation } from "@tanstack/react-query";

import { authService } from "@/services/auth/auth.service";

import type {
  LoginData,
  RegisterData,
} from "@/types/auth";

function saveAuth(data: {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "TEACHER";
  };
}) {
  localStorage.setItem(
    "auth",
    JSON.stringify(data),
  );
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginData) =>
      authService.login(data),

    onSuccess: (data) => {
      saveAuth(data);
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterData) =>
      authService.register(data),

    onSuccess: (data) => {
      saveAuth(data);
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem("auth");
    },
  });
}