/**
 * API client wrapper with auth header and error handling
 */

interface FetchOptions extends RequestInit {
  baseUrl?: string;
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const {baseUrl = process.env.NEXT_PUBLIC_API_URL || '', ...fetchOptions} = options;

  // Add auth header from cookie if available (for client-side calls)
  const headers = new Headers(fetchOptions.headers);

  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`API call failed: ${path}`, error);
    throw error;
  }
}

/**
 * Server-side API client for server components/actions
 * Includes bearer token from env
 */
export async function adminApi<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const {baseUrl = '', ...fetchOptions} = options;
  const headers = new Headers(fetchOptions.headers);

  // Add JWT token
  const token = process.env.ADMIN_JWT_SECRET;
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `/api/admin${path}`;

  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${url}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Admin API Error ${response.status}`);
  }

  return response.json() as Promise<T>;
}
