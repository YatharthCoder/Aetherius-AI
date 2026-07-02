/**
 * Generates or retrieves a persistent unique client ID for robust, non-overlapping API rate limits.
 * This ensures that when running behind reverse proxies, multiple users do not share the same quota limits.
 */
export const getOrCreateClientId = (): string => {
  if (typeof window === 'undefined') return 'ssr-env';
  try {
    let id = localStorage.getItem('aetherius_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem('aetherius_client_id', id);
    }
    return id;
  } catch (e) {
    console.warn("localStorage is blocked or threw an error, falling back to window-level client ID:", e);
    let win = window as any;
    if (!win.__aetherius_client_id) {
      win.__aetherius_client_id = 'client_mem_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    }
    return win.__aetherius_client_id;
  }
};

/**
 * Resets the client ID to generate a fresh session, allowing developers or testers
 * to easily refresh their quota during evaluation.
 */
export const regenerateClientId = (): string => {
  const newId = 'client_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
  if (typeof window === 'undefined') return 'ssr-env';
  try {
    localStorage.setItem('aetherius_client_id', newId);
  } catch (e) {
    console.warn("localStorage is blocked or threw an error on reset:", e);
    (window as any).__aetherius_client_id = newId;
  }
  return newId;
};

/**
 * A safe, standard fetch wrapper that automatically attaches the unique client ID header
 * to preserve individual API rate-limit quotas during judging and evaluation.
 */
export const fetchWithClientId = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const clientId = getOrCreateClientId();
  const options = init ? { ...init } : {};
  
  if (!options.headers) {
    options.headers = {};
  }
  
  if (options.headers instanceof Headers) {
    options.headers.set('X-Client-Id', clientId);
  } else if (Array.isArray(options.headers)) {
    options.headers.push(['X-Client-Id', clientId]);
  } else {
    (options.headers as Record<string, string>)['X-Client-Id'] = clientId;
  }
  
  return fetch(input, options);
};

