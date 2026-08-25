'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/types';
import { getToken, setToken, removeToken, decodeJwt } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface AuthContextType {
  userId: string | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string, redirectTo?: string) => Promise<void>;
  loginWithPassword: (email: string, password: string, redirectTo?: string) => Promise<void>;
  setPassword: (password: string) => Promise<void>;
  completeAccountSetup: (fullName: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Initialize auth from token in storage
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setTokenState(savedToken);
        setUserId(decoded.userId);
        setRole(decoded.role);
      } else {
        // Token expired
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const requestOtp = async (email: string) => {
    await authApi.requestOtp(email);
  };

  // Stores the access token and derives auth state from it. Returns the
  // decoded token so callers can branch on its claims (e.g. redirect target).
  const applyAccessToken = (accessToken: string) => {
    const decoded = decodeJwt(accessToken);
    if (!decoded) throw new Error('Invalid authentication response token');

    setToken(accessToken);
    setTokenState(accessToken);
    setUserId(decoded.userId);
    setRole(decoded.role);

    return decoded;
  };

  const verifyOtp = async (email: string, code: string, redirectTo?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, code);
      if (!response || !response.accessToken) {
        throw new Error('Failed to verify OTP');
      }

      applyAccessToken(response.accessToken);
      router.push(response.requiresPasswordSetup ? '/set-password' : (redirectTo || '/dashboard'));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (email: string, password: string, redirectTo?: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);
      if (!response || !response.accessToken) {
        throw new Error('Failed to log in');
      }

      applyAccessToken(response.accessToken);
      router.push(redirectTo || '/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const setPassword = async (password: string) => {
    await authApi.setPassword(password);
    router.push('/dashboard');
  };

  // Used on first login: new accounts must give themselves a real name and a
  // password before they can continue, so both are saved together here.
  const completeAccountSetup = async (fullName: string, password: string) => {
    await authApi.updateProfile(fullName);
    await authApi.setPassword(password);
    router.push('/dashboard');
  };

  const signOut = () => {
    removeToken();
    setTokenState(null);
    setUserId(null);
    setRole(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        role,
        token,
        isLoading,
        requestOtp,
        verifyOtp,
        loginWithPassword,
        setPassword,
        completeAccountSetup,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
