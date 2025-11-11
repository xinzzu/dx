'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAdminAuth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const isAdmin = localStorage.getItem('is_admin');

    if (!token || isAdmin !== 'true') {
      router.replace('/login-admin');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  return { isLoading };
}
