import { requireSession } from "@/lib/server-auth";
import { VerificationNotice } from "@/components/auth/verification-notice";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/layout/sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireSession(true);
  return (
    <main className="flex min-h-screen bg-background">
      <Sidebar />

      <section className="flex-1 p-8">
        <VerificationNotice user={user} />
        {children}
      </section>
    </main>
  );
}
