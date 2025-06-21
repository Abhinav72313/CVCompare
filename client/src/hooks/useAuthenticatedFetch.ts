"use client";

import { useAuth } from '@clerk/nextjs';
import { useCallback } from 'react';

export function useAuthenticatedFetch() {
  const { getToken } = useAuth();
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    // Don't set Content-Type for FormData, let the browser handle it
    const isFormData = options.body instanceof FormData;
    
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
      credentials:'include'
    });
  }, [getToken]);

  return authenticatedFetch;
}
