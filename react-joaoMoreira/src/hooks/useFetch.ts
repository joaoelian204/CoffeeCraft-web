import { useCallback, useEffect, useState } from 'react';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions {
  immediate?: boolean;
  dependencies?: any[];
}

export function useFetch<T>(
  fetchFunction: () => Promise<T>,
  options: UseFetchOptions = {}
) {
  const { immediate = true, dependencies = [] } = options;
  
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetchFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, [fetchFunction]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    ...state,
    execute,
    reset,
    refetch: execute,
  };
}

// Hook específico para arrays con funcionalidades adicionales
export function useFetchArray<T>(
  fetchFunction: () => Promise<T[]>,
  options: UseFetchOptions = {}
) {
  const fetchResult = useFetch(fetchFunction, options);
  const [localData, setLocalData] = useState<T[]>([]);

  // Sincronizar datos locales cuando llegan nuevos datos
  useEffect(() => {
    if (fetchResult.data) {
      setLocalData(fetchResult.data);
    }
  }, [fetchResult.data]);
  
  const addItem = useCallback((item: T) => {
    setLocalData(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setLocalData(prev => prev.filter(item => !predicate(item)));
  }, []);

  const updateItem = useCallback((predicate: (item: T) => boolean, updatedItem: Partial<T>) => {
    setLocalData(prev => prev.map(item => 
      predicate(item) ? { ...item, ...updatedItem } : item
    ));
  }, []);

  return {
    data: localData,
    loading: fetchResult.loading,
    error: fetchResult.error,
    execute: fetchResult.execute,
    reset: () => {
      fetchResult.reset();
      setLocalData([]);
    },
    refetch: fetchResult.refetch,
    addItem,
    removeItem,
    updateItem,
    isEmpty: localData.length === 0,
    count: localData.length,
  };
} 