import React from 'react';
import { cn } from '@/lib/utils';

export default function InputError({ message, className = '', ...props }) {
  if (Array.isArray(message)) {
    message = message.join('\n');
  } else {
    message = message || '';
  }

  if (!message) return null;

  return (
    <p {...props} className={cn('text-sm text-red-600 dark:text-red-400', className)}>
      {message}
    </p>
  );
}
