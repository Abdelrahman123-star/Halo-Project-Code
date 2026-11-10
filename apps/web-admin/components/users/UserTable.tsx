'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { PearlButton } from '@/components/ui/PearlButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { UserActionsModal } from './UserActionsModal';
import { Search, ShieldAlert, ShieldCheck, Settings } from 'lucide-react';

export type UserProfile = {
  id: string;
  display_name: string;
  gender: string | null;
  role: 'user' | 'admin';
  created_at: string;
};

type UserTableProps = {
  initialUsers: UserProfile[];
  currentAdminId: string;
};

export function UserTable({ initialUsers, currentAdminId }: UserTableProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  async function handleToggleRole(user: UserProfile) {
    if (user.id === currentAdminId && user.role === 'admin') {
      alert('You cannot demote yourself. Another administrator must change your role.');
      return;
    }

    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    const confirmText =
      nextRole === 'admin'
        ? `Are you sure you want to promote ${user.display_name || 'this user'} to Administrator?`
        : `Are you sure you want to demote ${user.display_name || 'this user'} to regular user?`;

    if (!window.confirm(confirmText)) return;

    setUpdatingId(user.id);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({ role: nextRole })
      .eq('id', user.id);

    setUpdatingId(null);

    if (error) {
      setMessage(`Failed to update role: ${error.message}`);
      return;
    }

    setUsers((prev) =>
      prev.map((item) => (item.id === user.id ? { ...item, role: nextRole } : item)),
    );
    setMessage(`Successfully updated ${user.display_name || 'user'} role to ${nextRole.toUpperCase()}`);
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-halo-plumMuted/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm text-halo-plum placeholder:text-halo-plumMuted/60"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-halo-plumMuted">Role:</span>
          {(['all', 'admin', 'user'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-white text-halo-plum shadow-sm border border-halo-periwinkle/30'
                  : 'text-halo-plumMuted hover:bg-white/40'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </GlassCard>

      {message && (
        <div className="p-3 rounded-xl bg-white/80 border border-halo-periwinkle/30 text-xs font-medium text-halo-plum shadow-sm">
          {message}
        </div>
      )}

      {/* Users Table */}
      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/60 text-xs font-semibold text-halo-plumMuted uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-halo-plum">
                        {user.display_name || 'Anonymous User'}
                      </div>
                      <div className="text-xs text-halo-plumMuted/80 font-mono">
                        {user.id}
                      </div>
                    </td>
                    <td className="p-4 text-xs font-medium capitalize text-halo-plum">
                      {user.gender || 'Not specified'}
                    </td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
                        {user.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-halo-plumMuted">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PearlButton
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </PearlButton>

                        <PearlButton
                          size="sm"
                          variant={user.role === 'admin' ? 'secondary' : 'pearl'}
                          loading={updatingId === user.id}
                          onClick={() => handleToggleRole(user)}
                          disabled={user.id === currentAdminId && user.role === 'admin'}
                        >
                          {user.role === 'admin' ? (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Demote</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Promote</span>
                            </>
                          )}
                        </PearlButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-halo-plumMuted">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* User Actions Modal */}
      {selectedUser && (
        <UserActionsModal
          user={selectedUser}
          currentAdminId={currentAdminId}
          onClose={() => setSelectedUser(null)}
          onUpdate={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setSelectedUser(updated);
          }}
          onDelete={(deletedId) => {
            setUsers((prev) => prev.filter((u) => u.id !== deletedId));
            setSelectedUser(null);
            setMessage('User account permanently deleted.');
          }}
        />
      )}
    </div>
  );
}

