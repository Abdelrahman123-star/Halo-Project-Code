'use client';

import { useState } from 'react';
import { PearlButton } from '@/components/ui/PearlButton';
import { KeyRound, Mail } from 'lucide-react';
import type { UserProfile } from './UserTable';

type UserSecurityTabProps = {
  user: UserProfile;
  onSetFeedback: (fb: { type: 'success' | 'error'; text: string } | null) => void;
};

export function UserSecurityTab({ user, onSetFeedback }: UserSecurityTabProps) {
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [loadingPass, setLoadingPass] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  async function handleSetPassword() {
    if (!newPassword || newPassword.length < 8) {
      onSetFeedback({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }
    setLoadingPass(true);
    onSetFeedback(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_password',
          userId: user.id,
          password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setNewPassword('');
      onSetFeedback({ type: 'success', text: 'User password updated successfully!' });
    } catch (err: unknown) {
      onSetFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Password update failed' });
    } finally {
      setLoadingPass(false);
    }
  }

  async function handleSendResetEmail() {
    if (!resetEmail || !resetEmail.includes('@')) {
      onSetFeedback({ type: 'error', text: 'Please enter a valid user email address.' });
      return;
    }
    setLoadingEmail(true);
    onSetFeedback(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_reset_email',
          userId: user.id,
          email: resetEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

      onSetFeedback({ type: 'success', text: `Password recovery link sent to ${resetEmail}!` });
    } catch (err: unknown) {
      onSetFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Reset email failed' });
    } finally {
      setLoadingEmail(false);
    }
  }

  return (
    <div className="space-y-5 text-xs">
      {/* Direct Password Reset */}
      <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-halo-plum">
          <KeyRound className="w-4 h-4 text-halo-periwinkle" />
          <span>Direct Password Update</span>
        </div>
        <p className="text-halo-plumMuted text-[11px] leading-relaxed">
          Assign a new password directly to this user account via Supabase Auth.
        </p>
        <input
          type="password"
          placeholder="Enter new password (min 8 chars)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-xl glass-input text-sm text-halo-plum"
        />
        <PearlButton size="sm" loading={loadingPass} onClick={handleSetPassword}>
          Set User Password
        </PearlButton>
      </div>

      {/* Email Reset Link */}
      <div className="p-3.5 rounded-xl bg-white/60 border border-white space-y-2.5">
        <div className="flex items-center gap-1.5 font-bold text-halo-plum">
          <Mail className="w-4 h-4 text-halo-periwinkle" />
          <span>Email Recovery Link</span>
        </div>
        <p className="text-halo-plumMuted text-[11px] leading-relaxed">
          Trigger a secure password reset link sent to the user&apos;s email address.
        </p>
        <input
          type="email"
          placeholder="user@example.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-xl glass-input text-sm text-halo-plum"
        />
        <PearlButton size="sm" variant="secondary" loading={loadingEmail} onClick={handleSendResetEmail}>
          Send Password Reset Email
        </PearlButton>
      </div>
    </div>
  );
}

