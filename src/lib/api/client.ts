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
      console.log(`[API DEBUG] Request: ${API_BASE_URL}${endpoint} Authorization: ${masked}`);
    }
  } catch {
    // ignore logging errors
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store', // Disable caching untuk data dinamis
  });

  if (!response.ok) {
    // Clone response untuk bisa read body multiple times
    const clonedResponse = response.clone();
    
    // Try to get error details from response body
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    let errorDetails: string | undefined;
    
    try {
      const errorJson = await response.json();
      console.error('❌ API Error Response:', errorJson);
      
      if (errorJson.meta?.message) {
        errorMessage = `${errorMessage} - ${errorJson.meta.message}`;
        errorDetails = errorJson.meta.message;
      }
      
      // Log validation errors if available
      if (errorJson.errors) {
        console.error('❌ Validation Errors:', errorJson.errors);
        errorDetails = JSON.stringify(errorJson.errors);
      }
      
      // Log any additional error info
      if (errorJson.error) {
        console.error('❌ Error Details:', errorJson.error);
      }
    } catch {
      // Response body tidak bisa di-parse sebagai JSON, try text
      try {
        const errorText = await clonedResponse.text();
        console.error('❌ Raw error response:', errorText);
        if (errorText) {
          errorDetails = errorText;
        }
      } catch {
        // Ignore if already consumed
      }
    }
    
    const finalError = new Error(errorMessage);
    // Attach details for debugging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (finalError as any).details = errorDetails;
    throw finalError;
  }

  const json: ApiResponse<T> = await response.json();

  // Cek response success dari backend
  if (!json.meta.success) {
    throw new Error(json.meta.message || 'API request failed');
  }

  return json.data;
}
