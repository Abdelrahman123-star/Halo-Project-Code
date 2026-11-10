import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/ui/StatCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Users, Shirt, Sparkles, Shield, ArrowRight } from 'lucide-react';

export default async function OverviewPage() {
  const supabase = await createClient();

  // 1. Total users count
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 2. Total admins count
  const { count: adminsCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin');

  // 3. Total garments count
  const { count: garmentsCount } = await supabase
    .from('wardrobe_items')
    .select('*', { count: 'exact', head: true });

  // 4. Fetch recent 5 wardrobe items
  const { data: recentGarments } = await supabase
    .from('wardrobe_items')
    .select('id, name, category, confidence, created_at, crop_base64')
    .order('created_at', { ascending: false })
    .limit(5);

  // 5. Fetch recent 5 users
  const { data: recentUsers } = await supabase
    .from('profiles')
    .select('id, display_name, gender, role, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <GlassCard className="p-6 bg-gradient-to-r from-white/80 via-white/60 to-halo-periwinkleLight/40 border-white/90">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-halo-plum tracking-tight">
              Platform Overview
            </h1>
            <p className="text-sm text-halo-plumMuted mt-1">
              Live statistics and recent activity across HALO user accounts and digital wardrobe scans.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/wardrobe"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white/80 text-halo-plum border border-white hover:bg-white transition-all shadow-sm"
            >
              Inspect Wardrobe
            </Link>
            <Link
              href="/users"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-pearl-gradient text-halo-plum border border-white/90 hover:brightness-105 transition-all shadow-sm"
            >
              Manage Users
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={usersCount ?? 0}
          subtitle="Registered accounts"
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Garments Scanned"
          value={garmentsCount ?? 0}
          subtitle="Computer Vision inputs"
          icon={<Shirt className="w-5 h-5" />}
        />
        <StatCard
          title="Platform Admins"
          value={adminsCount ?? 0}
          subtitle="Authorized operators"
          icon={<Shield className="w-5 h-5" />}
        />
        <StatCard
          title="AI Pipeline"
          value="Online"
          subtitle="Roboflow DeepFashion2"
          icon={<Sparkles className="w-5 h-5" />}
          trend="Active"
          trendUp={true}
        />
      </div>

      {/* Split Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
            <h2 className="text-base font-bold text-halo-plum flex items-center gap-2">
              <Shirt className="w-4 h-4 text-halo-periwinkle" />
              Recent Garment Scans
            </h2>
            <Link
              href="/wardrobe"
              className="text-xs font-semibold text-halo-periwinkle hover:text-halo-plum flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentGarments && recentGarments.length > 0 ? (
            <div className="space-y-3">
              {recentGarments.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/70 hover:bg-white/80 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {item.crop_base64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.crop_base64}
                        alt={item.name}
                        className="w-10 h-10 object-contain rounded-lg bg-white/90 border border-white p-0.5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-halo-lilac/30 flex items-center justify-center text-halo-plum text-xs font-bold">
                        CV
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-halo-plum leading-snug">
                        {item.name || item.category || 'Garment'}
                      </p>
                      <p className="text-xs text-halo-plumMuted capitalize">
                        {item.category?.replace(/_/g, ' ') || 'Unknown category'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={item.confidence && item.confidence > 0.8 ? 'success' : 'warning'}>
                      {item.confidence ? `${Math.round(item.confidence * 100)}%` : 'N/A'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-halo-plumMuted">
              No garments scanned yet.
            </div>
          )}
        </GlassCard>

        {/* Recent User Signups */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/60">
            <h2 className="text-base font-bold text-halo-plum flex items-center gap-2">
              <Users className="w-4 h-4 text-halo-periwinkle" />
              Recent User Signups
            </h2>
            <Link
              href="/users"
              className="text-xs font-semibold text-halo-periwinkle hover:text-halo-plum flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-white/70 hover:bg-white/80 transition-all"
                >
                  <div>
                    <p className="text-sm font-semibold text-halo-plum leading-snug">
                      {user.display_name || 'Anonymous User'}
                    </p>
                    <p className="text-xs text-halo-plumMuted">
                      {user.gender ? `Gender: ${user.gender}` : 'Gender: not set'} · Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Badge variant={user.role === 'admin' ? 'admin' : 'user'}>
                    {user.role === 'admin' ? 'ADMIN' : 'USER'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-halo-plumMuted">
              No users registered yet.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

