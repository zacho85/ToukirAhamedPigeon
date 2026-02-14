import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: { message?: string | string[], className?: string }) {
    if(Array.isArray(message)) {
        message = message.join('\n')
    } else {
        message = message || ''
    }
    return message ? (
        <p {...props} className={cn('text-sm text-red-600 dark:text-red-400', className)}>
            {message}
        </p>
    ) : null;
}
