
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateKg = (quantity: number, percentage: number) => ((quantity * percentage) / 100).toFixed(2);
