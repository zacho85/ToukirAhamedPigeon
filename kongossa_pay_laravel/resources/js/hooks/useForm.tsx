import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { FormErrors, FormState } from '@/types/forms';

interface UseFormOptions {
  onSuccess?: () => void;
  onError?: (errors: FormErrors) => void;
  preserveScroll?: boolean;
  preserveState?: boolean;
}

export function useForm<T extends Record<string, any>>(
  initialData: T,
  options: UseFormOptions = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [processing, setProcessing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const hasErrors = Object.keys(errors).length > 0;

  const setFormData = useCallback((field: keyof T, value: any) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsDirty(true);
    
    // Clear field error when user types
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  const setAllData = useCallback((newData: Partial<T>) => {
    setData((prev) => ({ ...prev, ...newData }));
    setIsDirty(true);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setIsDirty(false);
    setProcessing(false);
  }, [initialData]);

  const submit = useCallback((
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    submitOptions: UseFormOptions = {}
  ) => {
    const mergedOptions = { ...options, ...submitOptions };
    
    setProcessing(true);
    setErrors({});

    router[method](url, data, {
      preserveScroll: mergedOptions.preserveScroll ?? true,
      preserveState: mergedOptions.preserveState ?? true,
      onSuccess: () => {
        setProcessing(false);
        mergedOptions.onSuccess?.();
      },
      onError: (errors) => {
        setProcessing(false);
        setErrors(errors);
        mergedOptions.onError?.(errors);
      },
      onFinish: () => {
        setProcessing(false);
      },
    });
  }, [data, options]);

  const get = useCallback((url: string, submitOptions?: UseFormOptions) => {
    submit('get', url, submitOptions);
  }, [submit]);

  const post = useCallback((url: string, submitOptions?: UseFormOptions) => {
    submit('post', url, submitOptions);
  }, [submit]);

  const put = useCallback((url: string, submitOptions?: UseFormOptions) => {
    submit('put', url, submitOptions);
  }, [submit]);

  const patch = useCallback((url: string, submitOptions?: UseFormOptions) => {
    submit('patch', url, submitOptions);
  }, [submit]);

  const del = useCallback((url: string, submitOptions?: UseFormOptions) => {
    submit('delete', url, submitOptions);
  }, [submit]);

  return {
    data,
    errors,
    processing,
    isDirty,
    hasErrors,
    setData: setFormData,
    setAllData,
    clearErrors,
    reset,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}
