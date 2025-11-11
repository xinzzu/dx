export async function loginAdmin(email: string, password: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.meta?.success) {
      throw new Error(data.meta?.message || 'Login failed');
    }

    const token = data.data.access_token;
    const isAdmin = data.data.is_admin;

    localStorage.setItem('access_token', token);
    localStorage.setItem('is_admin', JSON.stringify(isAdmin));

    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(message);
  }
}
