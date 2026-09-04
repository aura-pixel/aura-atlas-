"use client";

import { useEffect, useState } from "react";

import {
  GraduationCap,
  Home,
  Settings,
  Users,
} from "lucide-react";

import { SidebarItem } from "./sidebar-item";

export function Sidebar() {

  const [user, setUser] = useState<{
  name: string;
  email: string;
} | null>(null);

useEffect(() => {
  const auth = localStorage.getItem("auth");

  if (!auth) return;

  const { user } = JSON.parse(auth);

  setUser(user);
}, []);

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-border bg-card">

      {/* Logo */}
      <div className="border-b border-border p-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Aura Atlas
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Panel Administrativo
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-2 p-4">

        <SidebarItem
          href="/dashboard"
          label="Inicio"
          icon={Home}
        />

        <SidebarItem
          href="/dashboard/universities"
          label="Universidades"
          icon={GraduationCap}
        />

        <SidebarItem
          href="/dashboard/teachers"
          label="Docentes"
          icon={Users}
        />

        <SidebarItem
          href="/dashboard/settings"
          label="Configuración"
          icon={Settings}
        />

      </nav>

      {/* Usuario */}
      <div className="border-t border-border p-5">
        <p className="font-semibold">
  {user?.name}
</p>

<p className="text-sm text-muted-foreground">
  {user?.email}
</p>
      </div>

    </aside>
  );
}