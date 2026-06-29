'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { requestOtp, verifyOtp } = useAuth();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset error when user changes email or values
  useEffect(() => {
    setError(null);
  }, [email, otpValues]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await requestOtp(email);
      setOtpSent(true);
      setSuccessMessage('OTP has been successfully sent to your email!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP. Please check your email and try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value.substring(value.length - 1); // Only keep the last character
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await verifyOtp(email, fullOtp);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid or expired OTP. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtpValues(['', '', '', '', '', '']);
    setError(null);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#F0F4F8] overflow-hidden px-4">
      {/* Premium Background Visual Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#005EB8]/10 to-[#00A3AD]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-[#00A3AD]/10 to-[#005EB8]/5 blur-3xl pointer-events-none" />
      
      {/* Decorative Brand Shape */}
      <div className="absolute top-8 left-8 flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/20">
          Z
        </div>
        <span className="text-xl font-bold text-primary tracking-wide">ZENEVA</span>
      </div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl shadow-slate-200/50 relative z-10 transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {otpSent ? 'Verify Access' : 'Welcome to Zeneva'}
          </h2>
          <p className="text-neutralBrand mt-2 text-sm">
            {otpSent 
              ? `We sent a one-time passcode to ${email}`
              : 'Sign in to access appointment booking, doctor slots, and healthcare resources'
            }
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium flex items-start gap-2 animate-shake">
            <svg className="w-5 h-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step 1: Request OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. patient@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            
            <Button
              type="submit"
              className="w-full py-3"
              isLoading={isSubmitting}
            >
              Send Verification Code
            </Button>
          </form>
        ) : (
          /* Step 2: Verify OTP Form */
          <form onSubmit={handleVerifyOtp} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Enter 6-Digit OTP</span>
              <div className="flex justify-between w-full gap-2 px-1">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => { otpInputsRef.current[idx] = el; }}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={isSubmitting}
                    className="otp-input w-12 h-12 md:w-14 md:h-14 bg-white border border-slate-200 rounded-xl text-center text-xl font-bold text-primary focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full py-3"
                isLoading={isSubmitting}
              >
                Verify & Sign In
              </Button>

              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={isSubmitting}
                className="w-full text-center text-sm font-medium text-slate-500 hover:text-primary transition-colors py-2"
              >
                ← Back to Email
              </button>
            </div>
          </form>
        )}

        {/* Footer Brand Info */}
        <div className="mt-8 text-center text-xs text-slate-400 font-medium">
          Secure, direct passwordless authentication. Zeneva © 2026.
        </div>
      </div>
    </div>
  );
}
