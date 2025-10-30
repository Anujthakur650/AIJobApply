type RateRecord = {
  count: number;
  expiresAt: number;
};

const globalScope = globalThis as typeof globalThis & {
  __rateLimiterStore?: Map<string, RateRecord>;
};

const getStore = () => {
  if (!globalScope.__rateLimiterStore) {
    globalScope.__rateLimiterStore = new Map();
  }
  return globalScope.__rateLimiterStore;
};

export const consumeRateLimit = (
  key: string,
  limit: number,
  windowMs: number
) => {
  const store = getStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || existing.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    });
    return {
      success: true,
      remaining: limit - 1,
      reset: now + windowMs,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: existing.expiresAt,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    success: true,
    remaining: limit - existing.count,
    reset: existing.expiresAt,
  };
};
