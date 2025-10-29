import clsx from "clsx";

export const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className={clsx("h-2 w-full rounded-full bg-slate-100", className)}>
    <div
      className="h-full rounded-full bg-[var(--primary)] transition-all"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
