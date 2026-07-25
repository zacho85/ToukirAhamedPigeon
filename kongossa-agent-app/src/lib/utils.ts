import { clsx, type ClassValue } from "clsx"
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useDebounce<T>(value: T, fn: (value: T) => void, delay = 400) {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => fn(value), delay);
    setTimeoutId(id);

    // Cleanup on unmount or when value changes
    return () => clearTimeout(id);
  }, [value]);
}

export function formatCurrency(amount: number, currency: string = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
