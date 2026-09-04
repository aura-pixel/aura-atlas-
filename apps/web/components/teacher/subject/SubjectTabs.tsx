"use client";

import {
  BookOpen,
  FileText,
  Layers3,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";

type Tab =
  | "resumen"
  | "informacion"
  | "estructura"
  | "contenidos"
  | "hipertexto";

type SubjectTabsProps = {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
};

const tabs = [
  {
    id: "resumen" as const,
    label: "Resumen",
    icon: LayoutDashboard,
  },
  {
    id: "informacion" as const,
    label: "Información",
    icon: FileText,
  },
  {
    id: "estructura" as const,
    label: "Estructura",
    icon: Layers3,
  },
  {
    id: "contenidos" as const,
    label: "Contenidos",
    icon: BookOpen,
  },
  {
    id: "hipertexto" as const,
    label: "Hipertexto",
    icon: Sparkles,
  },
];

export function SubjectTabs({
  activeTab,
  onChange,
}: SubjectTabsProps) {
  return (
    <div className="border-b border-[#4A1115]/10 bg-[#FFFDF8]/80 backdrop-blur-xl">

      <div className="mx-auto max-w-7xl px-6 lg:px-10">

        <nav
          className="flex gap-2 overflow-x-auto py-3"
          aria-label="Navegación de la materia"
        >

          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`
                  group
                  flex
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  transition-all
                  duration-200
                  ${
                    active
                      ? "bg-[#4A1115] text-[#FFFDF8] shadow-md shadow-[#4A1115]/10"
                      : "text-[#687584] hover:bg-[#F7F1E7] hover:text-[#4A1115]"
                  }
                `}
              >

                <Icon
                  className={`
                    h-4 w-4
                    transition-transform
                    duration-200
                    ${
                      active
                        ? "text-[#E8AFC0]"
                        : "text-[#687584] group-hover:text-[#4A1115]"
                    }
                  `}
                />

                {tab.label}

              </button>
            );
          })}

        </nav>

      </div>

    </div>
  );
}