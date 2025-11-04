/**
 * API Client with Authentication
 * Base URL dari environment variable
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cahayamu.id/api/v1';

interface ApiResponse<T> {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: T;
}

/**
 * Fetch data dari API dengan authentication token
 * @param endpoint - API endpoint (contoh: /area/provinces)
 * @param token - Bearer token dari backend
 * @param options - Additional fetch options
 * @returns Promise dengan data response
 */
export async function fetchWithAuth<T>(
  endpoint: string,
  token?: string | null,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers dari options
  if (options?.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  // Tambahkan Authorization header jika token tersedia
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Debug: log electricity-tariffs requests (masked token) to help debugging filtering
  try {
    if (endpoint.includes('electricity-tariffs')) {
      const masked = token ? `${String(token).slice(0, 8)}...` : 'none';
      // eslint-disable-next-line no-console
      console.log(`[API DEBUG] Request: ${API_BASE_URL}${endpoint} Authorization: ${masked}`);
    }
  } catch (e) {
    // ignore logging errors
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // Disable caching untuk data dinamis
  });

  if (!response.ok) {
    // Try to get error details from response body
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      console.error('❌ API Error Response:', errorJson);
      if (errorJson.meta?.message) {
        errorMessage = `${errorMessage} - ${errorJson.meta.message}`;
      }
      // Log validation errors if available
      if (errorJson.errors) {
        console.error('Validation Errors:', errorJson.errors);
      }
    } catch (e) {
      // Response body tidak bisa di-parse sebagai JSON
      console.error('❌ Raw error response:', await response.text());
    }
    throw new Error(errorMessage);
  }

  const json: ApiResponse<T> = await response.json();

  // Cek response success dari backend
  if (!json.meta.success) {
    throw new Error(json.meta.message || 'API request failed');
  }

  return json.data;
}
