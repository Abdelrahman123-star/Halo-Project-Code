'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PearlButton } from '@/components/ui/PearlButton';
import { Badge } from '@/components/ui/Badge';
import { LogOut, UserCheck } from 'lucide-react';

type AdminHeaderProps = {
  adminEmail?: string;
  adminName?: string;
};

export function AdminHeader({ adminEmail, adminName }: AdminHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="h-16 px-6 glass-panel rounded-2xl flex items-center justify-between shadow-glass-sm mb-6 border border-white/80">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-halo-plum tracking-tight">
          Management Portal
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin profile pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/70 border border-white shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-halo-periwinkle/15 flex items-center justify-center text-halo-periwinkle">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-halo-plum leading-none">
              {adminName || 'Administrator'}
            </p>
            <p className="text-[10px] text-halo-plumMuted mt-0.5 max-w-[130px] truncate">
              {adminEmail}
            </p>
          </div>
          <Badge variant="admin" className="ml-1">ADMIN</Badge>
        </div>

        {/* Sign out */}
        <PearlButton
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          title="Sign out of Admin Portal"
          className="text-halo-plumMuted hover:text-red-700 hover:bg-halo-rose/60"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </PearlButton>
      </div>
    </header>
  );
}

