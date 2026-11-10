'use client';

import { useState } from 'react';
import { PearlButton } from '@/components/ui/PearlButton';
import type { UserProfile } from './UserTable';

type UserProfileTabProps = {
  user: UserProfile;
  currentAdminId: string;
  onUpdate: (updated: UserProfile) => void;
  onSetFeedback: (fb: { type: 'success' | 'error'; text: string } | null) => void;
};

export function UserProfileTab({
  user,
  currentAdminId,
  onUpdate,
  onSetFeedback,
}: UserProfileTabProps) {
  const [displayName, setDisplayName] = useState(user.display_name || '');
  const [gender, setGender] = useState<'female' | 'male' | ''>((user.gender as 'female' | 'male') || '');
  const [role, setRole] = useState<'user' | 'admin'>(user.role);
  const [loading, setLoading] = useState(false);

  async function handleSaveProfile() {
    setLoading(true);
    onSetFeedback(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          userId: user.id,
          displayName,
          gender: gender || null,
          role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      const updated: UserProfile = {
        ...user,
        display_name: displayName,
        gender: gender || null,
        role,
      };
      onUpdate(updated);
      onSetFeedback({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: unknown) {
      onSetFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Update failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-halo-plum block mb-1">Full Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl glass-input text-sm text-halo-plum"
        />
      </div>

      <div>
        <label className="font-semibold text-halo-plum block mb-1">Gender</label>
        <div className="flex gap-2">
          {(['female', 'male'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                gender === g
                  ? 'bg-pearl-gradient text-halo-plum border-halo-periwinkle/40 shadow-xs'
                  : 'bg-white/50 text-halo-plumMuted border-white'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="font-semibold text-halo-plum block mb-1">Account Role</label>
        <div className="flex gap-2">
          {(['user', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              disabled={user.id === currentAdminId && r === 'user'}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                role === r
                  ? 'bg-halo-plum text-white border-halo-plum shadow-xs'
                  : 'bg-white/50 text-halo-plumMuted border-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <PearlButton loading={loading} onClick={handleSaveProfile} className="w-full">
          Save Profile Changes
        </PearlButton>
      </div>
    </div>
  );
}

