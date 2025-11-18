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

  // Dev-only debug: print masked Authorization header and endpoint so we can
  // verify the token reaches the fetch call. This helps find cases where the
  // token exists in localStorage but isn't passed into fetch.
  try {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || process.env.NODE_ENV !== 'production')) {
      const masked = token ? `${String(token).slice(0, 8)}... (len=${String(token).length})` : '<no-token>';
      console.debug(`[API DEBUG] Request: ${API_BASE_URL}${endpoint} Authorization: ${masked}`);
    }
  } catch {
    // ignore debug errors
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

    const finalError = new Error(errorMessage) as Error & { details?: string };
    // Attach details for debugging in a typed-safe way
    finalError.details = errorDetails;
    throw finalError;
  }

  const json: ApiResponse<T> = await response.json();

  // Cek response success dari backend
  if (!json.meta.success) {
    throw new Error(json.meta.message || 'API request failed');
  }

  return json.data;
}

// export async function fetchWithAuthFood<T>(
//   endpoint: string,
//   token?: string | null,
//   options?: RequestInit
// ): Promise<ApiResponse<T>> {

//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//   };

//   if (options?.headers) {
//     Object.assign(headers, options.headers);
//   }

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }

//   try {
//     if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || process.env.NODE_ENV !== 'production')) {
//       const masked = token ? `${String(token).slice(0, 8)}... (len=${String(token).length})` : '<no-token>';
//       console.debug(`[API DEBUG] Request: ${API_BASE_URL}${endpoint} Authorization: ${masked}`);
//     }
//   } catch {
//     // ignore debug errors
//   }

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//     cache: 'no-store',
//   });

//   let responseBody: any;
//   try {
//     responseBody = await response.json();
//   } catch {
//     const errorText = await response.text().catch(() => 'No response body');
//     if (!response.ok) {
//       throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
//     }
//     responseBody = {};
//   }


//   if (!response.ok) {
//     let errorMessage = `API Error: ${response.status} ${response.statusText}`;
//     let errorDetails: string | undefined;

//     console.error('❌ API Error Response:', responseBody);

//     if (responseBody?.meta?.message) {
//       errorMessage = `${errorMessage} - ${responseBody.meta.message}`;
//       errorDetails = responseBody.meta.message;
//     }

//     if (responseBody?.errors) {
//       console.error('❌ Validation Errors:', responseBody.errors);
//       errorDetails = JSON.stringify(responseBody.errors);
//     }

//     const finalError = new Error(errorMessage) as Error & { details?: string };
//     finalError.details = errorDetails;
//     throw finalError;
//   }

//   if (responseBody && responseBody.meta && !responseBody.meta.success) {
//     throw new Error(responseBody.meta.message || 'API request failed');
//   }

//   if (!responseBody || !responseBody.reqId) {
//     console.warn("⚠️ API response missing reqId or meta structure, returning raw body.");
//   }

//   return responseBody as ApiResponse<T>;
// }