import { CACHE_INVALIDATION_RULES, CacheEntity } from './cache-keys';

const canUseSessionStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

const uniqueStrings = (values: Array<string | null | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

export const invalidateCacheKeys = (keys: Array<string | null | undefined>) => {
  if (!canUseSessionStorage()) return;
  uniqueStrings(keys).forEach((key) => window.sessionStorage.removeItem(key));
};

export const invalidateCacheByPrefixes = (prefixes: Array<string | null | undefined>) => {
  if (!canUseSessionStorage()) return;
  const targetPrefixes = uniqueStrings(prefixes);
  if (targetPrefixes.length === 0) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < window.sessionStorage.length; i += 1) {
    const key = window.sessionStorage.key(i);
    if (!key) continue;
    if (targetPrefixes.some((prefix) => key.startsWith(prefix))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.sessionStorage.removeItem(key));
};

export const invalidateEntityCaches = (
  entity: CacheEntity,
  options?: {
    extraKeys?: string[];
    extraPrefixes?: string[];
  }
) => {
  const rule = CACHE_INVALIDATION_RULES[entity];
  if (!rule) return;

  invalidateCacheKeys([
    ...rule.keys,
    ...(options?.extraKeys || []),
  ]);

  invalidateCacheByPrefixes([
    ...rule.prefixes,
    ...(options?.extraPrefixes || []),
  ]);
};

