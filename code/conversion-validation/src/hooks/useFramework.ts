import { useState, useEffect } from 'react';

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): UseLocalStorageReturn<T> {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return { value: storedValue, setValue, removeValue };
}

interface UseDebounceReturn<T> {
  debouncedValue: T;
}

export function useDebounce<T>(value: T, delay: number): UseDebounceReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { debouncedValue };
}

interface UseIntervalReturn {
  clear: () => void;
}

export function useInterval(callback: () => void, delay: number | null): UseIntervalReturn {
  useEffect(() => {
    if (delay === null) return;

    const intervalId = setInterval(callback, delay);
    return () => clearInterval(intervalId);
  }, [callback, delay]);

  return {
    clear: () => {}
  };
}

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: any[] = []
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await asyncFunction();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

interface UseEventListenerReturn {
  remove: () => void;
}

export function useEventListener<T extends Event = Event>(
  element: EventTarget | null,
  event: string,
  handler: (event: T) => void,
  options?: AddEventListenerOptions
): UseEventListenerReturn {
  useEffect(() => {
    if (!element) return;

    const listener = (event: Event) => {
      handler(event as T);
    };

    element.addEventListener(event, listener, options);

    return () => {
      element.removeEventListener(event, listener, options);
    };
  }, [element, event, handler, options]);

  return {
    remove: () => {
      if (!element) return;
      element.removeEventListener(event, handler as EventListener, options);
    }
  };
}

interface UseMediaQueryReturn {
  matches: boolean;
}

export function useMediaQuery(query: string): UseMediaQueryReturn {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQuery.addListener(handler);
    setMatches(mediaQuery.matches);

    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return { matches };
}

interface UseResponsiveReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useResponsive(): UseResponsiveReturn {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return { isMobile, isTablet, isDesktop };
}