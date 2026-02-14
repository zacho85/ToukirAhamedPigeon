import { type ClassValue, clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function useDebounce<T>(value: any, fn: Function, delay = 400) {
    const [v, setV] = useState<any>(0);
    useEffect(() => {
        if (v) clearTimeout(v);
        setV(setTimeout(() => fn(value), delay));
    }, [value]);
}

export function formatCurrency(amount: number, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(amount);
}

export function checkPermissions(permission: string, authPermissions: string[]): boolean {
    if (!permission) return false;

    return authPermissions.includes(permission);
}