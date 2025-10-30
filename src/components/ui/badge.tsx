import clsx from "clsx";
import { ReactNode } from "react";

const styles = {
  info: "bg-blue-50 text-[var(--primary)]",
  success: "bg-emerald-50 text-emerald-600",
  warning: "bg-amber-50 text-amber-600",
  neutral: "bg-slate-100 text-slate-700",
};

export const Badge = ({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) => (
  <span
    className={clsx(
      "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
      styles[tone],
      className
    )}
  >
    {children}
  </span>
);
