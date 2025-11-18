/**
 * Auth Service
 * Service untuk autentikasi dengan backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cahayamu.id/api/v1';

// === Type Definitions ===

export interface AuthResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data?: {
    access_token: string;
    is_profile_complete: boolean;
  };
}

export interface GoogleLoginPayload {
  idToken: string; // Firebase ID Token
}

// === Auth Service ===

export const authService = {
  /**
   * Login with Google (send Firebase ID Token to backend)
   * @param idToken - Firebase ID Token from Google Auth
   * @returns Backend access token
   */
  // Map of inflight login promises by firebase idToken to avoid duplicate /auth/google calls
  _inflightLogins: new Map<string, Promise<string>>() ,

  async loginWithGoogle(idToken: string): Promise<string> {
    // If we already have a saved backend token, return it immediately (idempotent)
    const existing = authService.getToken();
    if (existing) {
      return existing;
    }

    // If there's an inflight request for the same idToken, reuse it
    const existingPromise = authService._inflightLogins.get(idToken);
    if (existingPromise) return existingPromise;

    console.log("📤 Sending Firebase token to backend...");

    const p = (async () => {
      const payload = { firebase_token: idToken };
      // ✅ Backend endpoint: /auth/google
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json: AuthResponse = await response.json();

      // Helpful debug: log status and whether access_token present (but never print the token itself)
      try {
        const hasToken = !!json?.data?.access_token;
        console.debug(`[authService] /auth/google -> status=${response.status} hasAccessToken=${hasToken}`);
      } catch {
        /* ignore debug failure */
      }

      if (!response.ok || !json.meta.success) {
        console.error("❌ Login failed:", json.meta?.message ?? json);
        throw new Error(json.meta?.message || 'Login failed');
      }

      if (!json.data?.access_token) {
        throw new Error('No access token received from backend');
      }

      console.log("✅ Login successful! Profile complete:", json.data.is_profile_complete);
      return json.data.access_token;
    })();

    // store inflight promise and ensure cleanup
    authService._inflightLogins.set(idToken, p);
    p.finally(() => authService._inflightLogins.delete(idToken));
    return p;
  },

  /**
   * Save access token to localStorage
   * @param token - Backend access token
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      // Save token under both modern and legacy keys to improve robustness across code paths
      try {
        localStorage.setItem('access_token', token);
      } catch {
        // ignore storage errors
      }
    }
  },

  /**
   * Get saved access token from localStorage
   * @returns Access token or null
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  /**
   * Remove access token from localStorage
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      try {
        // Remove common keys
        localStorage.removeItem('access_token');
        localStorage.removeItem('is_admin');

        // Remove any keys that likely contain tokens or auth data
        const tokenKeyReg = /token|access|auth|refresh|is_admin|firebase/i;
        Object.keys(localStorage).forEach((k) => {
          try {
            if (tokenKeyReg.test(k)) {
              localStorage.removeItem(k);
            }
          } catch {
            // ignore individual key errors
          }
        });

        // Clear sessionStorage keys related to login flows
        try {
          sessionStorage.removeItem('login_via');
          // also remove any session keys that look auth-related
          Object.keys(sessionStorage).forEach((k) => {
            if (tokenKeyReg.test(k)) sessionStorage.removeItem(k);
          });
        } catch {
          // ignore
        }

        // Try to clear non-HttpOnly cookies by expiring them
        try {
          const cookies = document.cookie ? document.cookie.split(';') : [];
          cookies.forEach((c) => {
            const eqPos = c.indexOf('=');
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            // only attempt to clear cookies that look auth-related
            if (tokenKeyReg.test(name)) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            }
          });
        } catch {
          // ignore cookie clear errors
        }
      } catch {
        // swallow
      }
    }
  },

  /**
   * Initiate WhatsApp flow by asking backend to send a WA message containing a magic link
   * @param phone_number - phone in E.164 (e.g. +6281...)
   */
  async initiateWhatsApp(phone_number: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/whatsapp/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number }),
    });

    // Always attempt to parse JSON body for better diagnostics
    let jsonBody: unknown = null;
    try {
      jsonBody = await response.json();
    } catch {
      // non-json response, keep null
      jsonBody = null;
    }

    // Helper to safely extract meaningful message from the parsed body
    const extractServerMessage = (body: unknown): string | null => {
      if (!body || typeof body !== 'object') return null
      const b = body as Record<string, unknown>
      const meta = b.meta
      if (meta && typeof meta === 'object') {
        const m = meta as Record<string, unknown>
        if (typeof m.message === 'string') return m.message
      }
      if (typeof b.message === 'string') return b.message
      try {
        return JSON.stringify(b)
      } catch {
        return null
      }
    }

    if (!response.ok) {
      // Compose a helpful message including backend-provided message when available
      const serverMsg = extractServerMessage(jsonBody)
      const msg = serverMsg || 'Gagal mengirim pesan WhatsApp. Silakan coba lagi.'
      // Log full response for debugging in dev console
      console.debug('[authService] initiateWhatsApp failed', {
        phone_number,
        status: response.status,
        statusText: response.statusText,
        body: jsonBody,
      })
      throw new Error(msg)
    }

    // Success: log backend response for debugging (no sensitive data)
    console.debug('[authService] initiateWhatsApp success', { phone_number, body: jsonBody })
  },

  /**
   * Exchange magic-token obtained from WhatsApp link for backend access token
   * @param token - magic token from WA link
   * @returns backend access token
   */
  async exchangeWhatsAppToken(token: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/auth/whatsapp/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const json = await response.json();
    // try to read common shapes
    const maybeToken = json?.data?.token || json?.data?.access_token || json?.token || json?.access_token;
    if (!response.ok || !maybeToken) {
      const msg = json?.meta?.message || 'Gagal menukarkan token WhatsApp.';
      throw new Error(msg);
    }
    return maybeToken;
  },
};
