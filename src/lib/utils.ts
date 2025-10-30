import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number, locale = "en-US") =>
  new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

export const formatDelta = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
