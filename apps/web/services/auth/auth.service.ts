import { get, post } from "@/lib/api";

import type {
  AuthMe,
  AuthResponse,
  LoginData,
  RegisterData,
} from "@/types/auth";

export const authService = {
  login(data: LoginData) {
    return post<AuthResponse>(
      "/auth/login",
      data,
    );
  },

  register(data: RegisterData) {
    return post<AuthResponse>(
      "/auth/register",
      data,
    );
  },

  me() {
    return get<AuthMe>("/auth/me");
  },
};