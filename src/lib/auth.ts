import { DecodedToken } from '@/types';

// Simple JWT decoder client-side/server-side
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as DecodedToken;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Cookie helpers for JWT storage
export function setToken(token: string) {
  // Set cookie valid for 7 days
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  
  if (typeof window !== 'undefined') {
    document.cookie = `zeneva_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    localStorage.setItem('zeneva_token', token);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;

  // Try cookie first
  const name = 'zeneva_token=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  // Fallback to localStorage
  return localStorage.getItem('zeneva_token');
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    document.cookie = 'zeneva_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    localStorage.removeItem('zeneva_token');
  }
}
