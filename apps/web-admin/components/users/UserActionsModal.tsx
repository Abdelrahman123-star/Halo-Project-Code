'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { PearlButton } from '@/components/ui/PearlButton';
import { UserProfileTab } from './UserProfileTab';
import { UserSecurityTab } from './UserSecurityTab';
import {
  X,
  User,
  KeyRound,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { UserProfile } from './UserTable';

type UserActionsModalProps = {
  user: UserProfile;
  currentAdminId: string;
  onClose: () => void;
  onUpdate: (updated: UserProfile) => void;
  onDelete: (userId: string) => void;
};

export function UserActionsModal({
  user,
  currentAdminId,
  onClose,
  onUpdate,
  onDelete,
}: UserActionsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger'>('profile');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleDeleteUser() {
    if (user.id === currentAdminId) {
      setFeedback({ type: 'error', text: 'You cannot delete your own admin account.' });
      return;
    }
    if (!window.confirm(`Permanently delete account for "${user.display_name || user.id}"? This cannot be undone.`)) {
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');

      onDelete(user.id);
      onClose();
    } catch (err: unknown) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Deletion failed' });
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-halo-plum/20 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-lg p-6 relative shadow-glass-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/70 hover:bg-white text-halo-plum transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/60">
          <User className="w-4 h-4 text-halo-periwinkle" />
          <h2 className="text-base font-bold text-halo-plum truncate">
            Manage User: {user.display_name || 'Anonymous User'}
          </h2>
        </div>

        {/* Status Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-halo-rose text-red-800 border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/50 border border-white/80 mb-5">
          {(
            [
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'security', label: 'Password & Security', icon: KeyRound },
              { id: 'danger', label: 'Danger Zone', icon: Trash2 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFeedback(null);
                }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-halo-plum shadow-sm border border-halo-periwinkle/30'
                    : 'text-halo-plumMuted hover:bg-white/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <UserProfileTab
            user={user}
            currentAdminId={currentAdminId}
            onUpdate={onUpdate}
            onSetFeedback={setFeedback}
          />
        )}

        {/* Tab 2: Security & Password */}
        {activeTab === 'security' && (
          <UserSecurityTab
            user={user}
            onSetFeedback={setFeedback}
          />
        )}

        {/* Tab 3: Danger Zone */}
        {activeTab === 'danger' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-halo-rose/60 border border-red-200/80 space-y-2 text-rose-900">
              <h4 className="font-bold flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-600" />
                Delete User Account
              </h4>
              <p className="text-[11px] leading-relaxed">
                Permanently deletes this user profile and cascades removal of their wardrobe items and scans. This action cannot be undone.
              </p>
              <div className="pt-2">
                <PearlButton
                  variant="danger"
                  loading={loading}
                  onClick={handleDeleteUser}
                  disabled={user.id === currentAdminId}
                >
                  Delete Account Permanently
                </PearlButton>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/60 flex justify-end">
          <PearlButton size="sm" variant="secondary" onClick={onClose}>
            Close
          </PearlButton>
        </div>
      </GlassCard>
    </div>
  );
}
