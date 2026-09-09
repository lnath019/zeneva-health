'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LOGO_SRC, LOGO_ALT } from '@/config/brand'

const OTP_LENGTH = 6

function LoginForm() {
  const { requestOtp, verifyOtp, loginWithPassword } = useAuth()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || undefined

  const [mode, setMode] = useState<'otp' | 'password'>('otp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const inputs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setError(null)
  }, [email, otp, password])

  function switchMode(next: 'otp' | 'password') {
    setMode(next)
    setError(null)
    setPassword('')
  }

  async function sendOtp(e: FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await requestOtp(email)
      setStep('otp')
      setInfo('We sent a code to your email.')
      setTimeout(() => setInfo(null), 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault()

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      await loginWithPassword(email, password, redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  async function submitOtp(e: FormEvent) {
    e.preventDefault()

    const code = otp.join('')
    if (code.length < OTP_LENGTH) {
      setError('Enter all 6 digits.')
      return
    }
    setLoading(true)
    try {
      await verifyOtp(email, code, redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That code is invalid or expired.')
    } finally {
      setLoading(false)
    }
  }

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    if (value && !digit) return
    setOtp((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus()
    }
  }

  function onDigitKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function resetToEmail() {
    setStep('email')
    setOtp(Array(OTP_LENGTH).fill(''))
    setError(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tertiary px-4">
      <div className="absolute left-8 top-8 select-none">
        <img src={LOGO_SRC} alt={LOGO_ALT} className="h-12 w-auto" />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            {step === 'otp' ? 'Verify access' : 'Welcome to Zeniva'}
          </h1>
          <p className="mt-2 text-sm text-neutralBrand">
            {step === 'otp'
              ? `We sent a one-time passcode to ${email}`
              : 'Sign in to book appointments and view doctor availability.'}
          </p>
        </div>

        {step === 'email' && (
          <div className="mb-6 flex rounded-lg bg-tertiary p-1">
            <button
              type="button"
              onClick={() => switchMode('otp')}
              disabled={loading}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                mode === 'otp' ? 'bg-white text-primary shadow-sm' : 'text-neutralBrand'
              }`}
            >
              Email code
            </button>
            <button
              type="button"
              onClick={() => switchMode('password')}
              disabled={loading}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                mode === 'password' ? 'bg-white text-primary shadow-sm' : 'text-neutralBrand'
              }`}
            >
              Password
            </button>
          </div>
        )}

        {error && (
          <p className="mb-6 rounded-lg border p-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        {info && (
          <p className="mb-6 rounded-lg border p-3 text-sm font-medium text-emerald-700">
            {info}
          </p>
        )}

        {step === 'email' && mode === 'password' ? (
          <form onSubmit={submitPassword} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full py-3" isLoading={loading}>
              Sign in
            </Button>
          </form>
        ) : step === 'email' ? (
          <form onSubmit={sendOtp} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="patient@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" className="w-full py-3" isLoading={loading}>
              Send code
            </Button>
          </form>
        ) : (
          <form onSubmit={submitOtp} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enter 6-digit code
              </span>
              <div className="flex w-full justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => {
                      inputs.current[i] = el
                    }}
                    onChange={(e) => updateDigit(i, e.target.value)}
                    onKeyDown={(e) => onDigitKeyDown(i, e)}
                    disabled={loading}
                    aria-label={`Digit ${i + 1}`}
                    className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:h-14 md:w-14"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Button type="submit" className="w-full py-3" isLoading={loading}>
                Verify & sign in
              </Button>
              <button
                type="button"
                onClick={resetToEmail}
                disabled={loading}
                className="w-full py-2 text-center text-sm font-medium text-slate-500 hover:text-primary"
              >
                Back to email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
