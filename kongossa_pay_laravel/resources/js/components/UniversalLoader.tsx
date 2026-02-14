import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export function UniversalLoader() {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const start = () => {
            timeout = setTimeout(() => setIsLoading(true), 250);
        };

        const finish = () => {
            clearTimeout(timeout);
            setIsLoading(false);
        };

        const unregisterStart = router.on('start', start);
        const unregisterFinish = router.on('finish', finish);
        const unregisterError = router.on('error', finish);
        const unregisterCancel = router.on('cancel', finish);

        return () => {
            unregisterStart();
            unregisterFinish();
            unregisterError();
            unregisterCancel();
            clearTimeout(timeout);
        };
    }, []);

    if (!isLoading) {
        return null;
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
            <LoadingSpinner size='lg' text='Loading page...' />
        </div>
    );
}
