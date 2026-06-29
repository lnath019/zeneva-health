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
  verifyOtp: (email: string, code: string) => Promise<void>;
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

  const verifyOtp = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.verifyOtp(email, code);
      if (response && response.accessToken) {
        const accessToken = response.accessToken;
        setToken(accessToken);
        setTokenState(accessToken);
        
        const decoded = decodeJwt(accessToken);
        if (decoded) {
          setUserId(decoded.userId);
          setRole(decoded.role);
          
          // Successful log in, redirect to dashboard
          router.push('/dashboard');
        } else {
          throw new Error('Invalid authentication response token');
        }
      } else {
        throw new Error('Failed to verify OTP');
      }
    } finally {
      setIsLoading(false);
    }
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
