import { useCallback, useState } from 'react';
import { BASE_CACHE_KEYS, CACHE_PREFIXES, LEGACY_CACHE_KEYS } from '@/lib/cache-keys';
import { invalidateCacheByPrefixes, invalidateCacheKeys } from '@/lib/cache-invalidation';

interface CacheConfig {
  key: string;
  duration?: number; // milliseconds, default 5 minutes
}

interface CachedData<T> {
  timestamp: number;
  data: T;
}

const canUseSessionStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export function useCache<T>(config: CacheConfig) {
  const { key, duration = 300000 } = config; // default 5 minutes
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getCache = useCallback((): T | null => {
    if (!canUseSessionStorage()) return null;

    try {
      const cached = window.sessionStorage.getItem(key);
      if (!cached) return null;

      const parsed: CachedData<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - parsed.timestamp < duration) {
        return parsed.data;
      }

      window.sessionStorage.removeItem(key);
      return null;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }, [key, duration]);

  const setCache = useCallback((data: T) => {
    if (!canUseSessionStorage()) return;

    try {
      const cacheData: CachedData<T> = {
        timestamp: Date.now(),
        data,
      };
      window.sessionStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    invalidateCacheKeys([key]);
  }, [key]);

  const clearCaches = useCallback((keys: string[]) => {
    invalidateCacheKeys(keys);
  }, []);

  const clearByPrefixes = useCallback((prefixes: string[]) => {
    invalidateCacheByPrefixes(prefixes);
  }, []);

  const clearAllCaches = useCallback(() => {
    invalidateCacheKeys([...BASE_CACHE_KEYS, ...LEGACY_CACHE_KEYS]);
    invalidateCacheByPrefixes(Object.values(CACHE_PREFIXES));
  }, []);

  return {
    getCache,
    setCache,
    clearCache,
    clearCaches,
    clearByPrefixes,
    clearAllCaches,
    isRefreshing,
    setIsRefreshing,
  };
}

