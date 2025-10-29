import clsx from "clsx";
import { ReactNode } from "react";

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={clsx(
      "rounded-2xl border border-slate-200 bg-white shadow-sm",
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
    <div>
      <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
    </div>
    {action}
  </div>
);

export const CardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={clsx("px-6 py-5", className)}>{children}</div>
);
