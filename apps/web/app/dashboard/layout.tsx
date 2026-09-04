import type { ReactNode } from "react";

import { Sidebar } from "@/components/dashboard/layout/sidebar";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <main className="flex min-h-screen bg-background">
      <Sidebar />

      <section className="flex-1 p-8">
        {children}
      </section>
    </main>
  );
}