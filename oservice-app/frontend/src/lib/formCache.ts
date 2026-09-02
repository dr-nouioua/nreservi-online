const PREFIX = 'oservice_form_';

/**
 * Save form data to localStorage with a key.
 * Protects against internet drops / accidental navigation.
 */
export function saveFormCache<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
    });
    localStorage.setItem(PREFIX + key, serialized);
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Retrieve cached form data. Returns null if expired (> 24 hours) or missing.
 */
export function getFormCache<T>(key: string, maxAgeMs = 86400000): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const { data, timestamp } = JSON.parse(raw);

    if (Date.now() - timestamp > maxAgeMs) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }

    return data as T;
  } catch {
    return null;
  }
}

/**
 * Remove a specific form cache entry.
 */
export function clearFormCache(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // fail silently
  }
}

/**
 * Clear all form caches for this domain.
 */
export function clearAllFormCaches(): void {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // fail silently
  }
}
