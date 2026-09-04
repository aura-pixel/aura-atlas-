import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <section className="rounded-3xl border bg-card shadow-sm">
      <div className="border-b p-6">

        <h2 className="text-xl font-semibold">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}

      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}