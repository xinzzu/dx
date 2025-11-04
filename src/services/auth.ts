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
  async loginWithGoogle(idToken: string): Promise<string> {
    console.log("📤 Sending Firebase token to backend...");
    
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

    if (!response.ok || !json.meta.success) {
      console.error("❌ Login failed:", json.meta.message);
      throw new Error(json.meta.message || 'Login failed');
    }

    if (!json.data?.access_token) {
      throw new Error('No access token received from backend');
    }

    console.log("✅ Login successful! Profile complete:", json.data.is_profile_complete);
    return json.data.access_token;
  },

  /**
   * Save access token to localStorage
   * @param token - Backend access token
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
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
      localStorage.removeItem('access_token');
    }
  },
};
