'use client';

import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useApi } from '@/hooks/useApi';
import { authApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const MIN_PASSWORD_LENGTH = 8;

export function AccountSettings() {
  const { data: profile, isLoading, error, execute: fetchMe, setData } = useApi(authApi.getMe);

  const [fullName, setFullName] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    if (!fullName.trim()) {
      setNameError('Full name is required.');
      return;
    }

    setNameSaving(true);
    try {
      const updated = await authApi.updateProfile(fullName.trim());
      setData(updated);
      setNameSuccess('Name updated.');
      setTimeout(() => setNameSuccess(null), 4000);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'Could not update your name.');
    } finally {
      setNameSaving(false);
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`New password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (profile?.hasPassword && !currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }

    setPasswordSaving(true);
    try {
      await authApi.changePassword(profile?.hasPassword ? currentPassword : undefined, newPassword);
      setData({ ...profile!, hasPassword: true });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSuccess('Password updated.');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not update your password.');
    } finally {
      setPasswordSaving(false);
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl text-sm font-medium">
        Error loading your profile: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
        <p className="text-slate-500 text-xs mt-1">
          Update your name and manage how you sign in.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-lg">
        <h3 className="text-base font-bold text-slate-800 mb-4">Full Name</h3>

        {nameError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            {nameError}
          </p>
        )}
        {nameSuccess && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            {nameSuccess}
          </p>
        )}

        <form onSubmit={saveName} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={nameSaving}
            required
          />
          <Button type="submit" isLoading={nameSaving}>
            Save Name
          </Button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-lg">
        <h3 className="text-base font-bold text-slate-800 mb-1">
          {profile?.hasPassword ? 'Change Password' : 'Set a Password'}
        </h3>
        <p className="text-slate-500 text-xs mb-4">
          {profile?.hasPassword
            ? 'Enter your current password to set a new one.'
            : "You don't have a password yet — set one to log in without an email code."}
        </p>

        {passwordError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
            {passwordError}
          </p>
        )}
        {passwordSuccess && (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
            {passwordSuccess}
          </p>
        )}

        <form onSubmit={savePassword} className="space-y-4">
          {profile?.hasPassword && (
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={passwordSaving}
              required
            />
          )}
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={passwordSaving}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={passwordSaving}
            required
          />
          <Button type="submit" isLoading={passwordSaving}>
            {profile?.hasPassword ? 'Save Password' : 'Set Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
