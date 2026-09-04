export type Role =
  | "SUPER_ADMIN"
  | "TEACHER";

export type TeacherType =
  | "ADJUNCT"
  | "FULL_TIME"
  | "OTHER";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  teacherType: TeacherType;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthMe {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}