import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { useState, useEffect } from 'react';

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 

export function useDebounce(value, fn, delay = 400) {
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    if (timeoutId) clearTimeout(timeoutId);

    const id = setTimeout(() => fn(value), delay);
    setTimeoutId(id);

    // Cleanup on unmount or when value changes
    return () => clearTimeout(id);
  }, [value]);
}

export function formatCurrency(amount, currency) {
  currency = currency || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
