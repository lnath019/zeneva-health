'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LOGO_SRC, LOGO_ALT } from '@/config/brand'

const MIN_PASSWORD_LENGTH = 8

export default function SetPasswordPage() {
  const { token, isLoading: authLoading, completeAccountSetup } = useAuth()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [password, setPasswordValue] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !token) {
      router.replace('/login')
    }
  }, [authLoading, token, router])

  useEffect(() => {
    setError(null)
  }, [fullName, password, confirmPassword])

  async function submit(e: FormEvent) {
    e.preventDefault()

    if (!fullName.trim()) {
      setError('Please tell us your name.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await completeAccountSetup(fullName.trim(), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set up your account. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tertiary px-4">
      <div className="absolute left-8 top-8 select-none">
        <img src={LOGO_SRC} alt={LOGO_ALT} className="h-10 w-auto" />
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Welcome! Let&apos;s set up your account</h1>
          <p className="mt-2 text-sm text-neutralBrand">
            Tell us your name and set a password so you can log in without waiting for an email code next time.
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-lg border p-3 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPasswordValue(e.target.value)}
            disabled={loading}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
          />
          <Button type="submit" className="w-full py-3" isLoading={loading}>
            Save & continue
          </Button>
        </form>
      </div>
    </div>
  )
}
