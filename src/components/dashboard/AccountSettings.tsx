'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { authApi, doctorApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

const MIN_PASSWORD_LENGTH = 8;

export function AccountSettings() {
  const { role } = useAuth();
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

  // Doctor profile photo
  const [doctorImageUrl, setDoctorImageUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  useEffect(() => {
    if (role !== 'doctor') return;
    setPhotoLoading(true);
    doctorApi
      .getMyProfile()
      .then((doc) => setDoctorImageUrl(doc.imageUrl))
      .catch(() => {
        // silently ignore — photo section just shows the upload prompt with no current image
      })
      .finally(() => setPhotoLoading(false));
  }, [role]);

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

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoError(null);
    setPhotoSuccess(null);
    setPhotoUploading(true);
    try {
      const imageUrl = await doctorApi.uploadImage(file);
      await doctorApi.updateMyProfile({ imageUrl });
      setDoctorImageUrl(imageUrl);
      setPhotoSuccess('Profile photo updated.');
      setTimeout(() => setPhotoSuccess(null), 4000);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not upload photo.');
    } finally {
      setPhotoUploading(false);
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

      {role === 'doctor' && (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm max-w-lg">
          <h3 className="text-base font-bold text-slate-800 mb-1">Profile Photo</h3>
          <p className="text-slate-500 text-xs mb-4">
            Shown to patients when they browse available doctors.
          </p>

          {photoError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-600">
              {photoError}
            </p>
          )}
          {photoSuccess && (
            <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              {photoSuccess}
            </p>
          )}

          <div className="flex items-center gap-4">
            <div
              onClick={handlePhotoClick}
              className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center shrink-0 text-primary font-bold text-2xl relative overflow-hidden cursor-pointer group"
            >
              {photoLoading ? (
                <Spinner size="sm" />
              ) : doctorImageUrl ? (
                <img src={doctorImageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                fullName.replace(/^Dr\.?\s*/i, '').slice(0, 1).toUpperCase() || 'D'
              )}

              <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                {photoUploading ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <Button type="button" variant="outline" size="sm" onClick={handlePhotoClick} isLoading={photoUploading}>
                {doctorImageUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <p className="text-slate-400 text-[11px] mt-1.5">JPG, PNG, WEBP, or GIF — up to 5MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handlePhotoSelected}
            />
          </div>
        </div>
      )}

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