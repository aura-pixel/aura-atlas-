import type { ReactNode } from "react";
import { AuthExperience } from "@/components/auth/auth-experience";

export default function AccessLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthExperience />
      {children}
    </>
  );
}
