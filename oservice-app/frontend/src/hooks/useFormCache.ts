'use client';

import { useState, useEffect, useCallback } from 'react';
import { saveFormCache, getFormCache, clearFormCache } from '@/lib/formCache';

export function useFormCache<T>(key: string, initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  useEffect(() => {
    const cached = getFormCache<T>(key);
    if (cached) {
      setValues({ ...initialValues, ...cached });
    }
  }, [key]);

  const updateValues = useCallback(
    (updater: Partial<T> | ((prev: T) => T)) => {
      setValues((prev) => {
        const next = typeof updater === 'function'
          ? (updater as (p: T) => T)(prev)
          : { ...prev, ...updater };
        saveFormCache(key, next);
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    clearFormCache(key);
  }, [key, initialValues]);

  return { values, updateValues, reset };
}
