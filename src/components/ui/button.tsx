import clsx from "clsx";
import { forwardRef } from "react";

const variantClasses = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-blue-700 focus-visible:ring-blue-200",
  secondary:
    "bg-white text-[var(--primary)] border border-blue-200 hover:bg-blue-50",
  ghost:
    "bg-transparent text-[var(--primary)] hover:bg-blue-50",
  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-300",
};

const sizeClasses = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          loading && "opacity-80 cursor-wait",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? "Please wait..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
