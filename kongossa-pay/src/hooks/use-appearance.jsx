import { useCallback, useEffect, useState } from 'react';

const prefersDark = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name, value, days = 365) => {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

export const applyTheme = (appearance) => {
  const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', isDark);
};

export const mediaQuery = () => {
  if (typeof window === 'undefined') return null;
  return window.matchMedia('(prefers-color-scheme: dark)');
};

export const handleSystemThemeChange = () => {
  const currentAppearance = localStorage.getItem('appearance') || 'system';
  applyTheme(currentAppearance);
};

export function initializeTheme() {
  const savedAppearance = localStorage.getItem('appearance') || 'system';
  applyTheme(savedAppearance);

  const mq = mediaQuery();
  if (mq) {
    mq.addEventListener('change', handleSystemThemeChange);
  }
}

export function useAppearance() {
  const [appearance, setAppearance] = useState('system');

  const updateAppearance = useCallback((mode) => {
    setAppearance(mode);

    localStorage.setItem('appearance', mode);
    setCookie('appearance', mode);
    applyTheme(mode);
  }, []);

  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearance') || 'system';
    updateAppearance(savedAppearance);

    return () => {
      const mq = mediaQuery();
      if (mq) mq.removeEventListener('change', handleSystemThemeChange);
    };
  }, [updateAppearance]);

  return { appearance, updateAppearance };
}
