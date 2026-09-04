import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InfoCardProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function InfoCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: InfoCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-6 shadow-sm",
        className
      )}
    >
      {(title || subtitle) && (
        <div>
          {title && (
            <h2 className="text-xl font-semibold">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children && (
        <div className={title || subtitle ? "mt-6" : ""}>
          {children}
        </div>
      )}

      {footer && (
        <div className="mt-6 border-t pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}