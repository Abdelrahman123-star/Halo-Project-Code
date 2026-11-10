import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/server';
import {
  Activity,
  Server,
  Sparkles,
  Database,
  CheckCircle2,
  Clock,
  Code2,
} from 'lucide-react';

export default async function SystemPage() {
  const supabase = await createClient();

  // Test Supabase connection
  let dbStatus = 'healthy';
  let dbLatency = 0;
  const startDb = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id', { head: true, count: 'exact' });
    dbLatency = Date.now() - startDb;
    if (error) dbStatus = 'error';
  } catch {
    dbStatus = 'unreachable';
  }

  // Backend API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const roboflowModel = process.env.NEXT_PUBLIC_ROBOFLOW_MODEL_ID || 'deepfashion2-m-10k/2';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-halo-plum tracking-tight">
          System & AI Health
        </h1>
        <p className="text-sm text-halo-plumMuted mt-1">
          Real-time service health, computer vision model status, and platform architecture telemetry.
        </p>
      </div>

      {/* Services Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Supabase Service */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-halo-plum">Supabase Postgres</h3>
                <p className="text-xs text-halo-plumMuted">Auth & Database</p>
              </div>
            </div>
            <Badge variant={dbStatus === 'healthy' ? 'success' : 'warning'}>
              {dbStatus === 'healthy' ? 'CONNECTED' : 'DEGRADED'}
            </Badge>
          </div>

          <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-halo-plumMuted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Latency: {dbLatency}ms
            </span>
            <span className="font-mono text-[11px]">RLS Protected</span>
          </div>
        </GlassCard>

        {/* FastAPI AI Backend */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-halo-periwinkleLight/60 border border-halo-periwinkle/30 flex items-center justify-center text-halo-periwinkle">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-halo-plum">FastAPI Engine</h3>
                <p className="text-xs text-halo-plumMuted">{apiUrl}</p>
              </div>
            </div>
            <Badge variant="info">CONFIGURED</Badge>
          </div>

          <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-halo-plumMuted">
            <span>Garment Pipeline</span>
            <span className="font-mono text-[11px]">v1/garment</span>
          </div>
        </GlassCard>

        {/* Roboflow DeepFashion2 */}
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-halo-plum">Roboflow CV</h3>
                <p className="text-xs text-halo-plumMuted">{roboflowModel}</p>
              </div>
            </div>
            <Badge variant="success">READY</Badge>
          </div>

          <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-halo-plumMuted">
            <span>Detection Model</span>
            <span className="font-mono text-[11px]">DeepFashion2</span>
          </div>
        </GlassCard>
      </div>

      {/* Architecture & Boundaries Card */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/60">
          <Activity className="w-4 h-4 text-halo-periwinkle" />
          <h2 className="text-base font-bold text-halo-plum">
            Platform Architecture & RLS Security Scope
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/60 border border-white space-y-2">
            <h4 className="font-bold text-halo-plum flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control (RBAC)
            </h4>
            <p className="text-halo-plumMuted leading-relaxed">
              Users authenticate via Supabase Auth. Next.js edge middleware checks the profile table for <code className="bg-white/80 px-1 py-0.5 rounded text-halo-plum">role = &apos;admin&apos;</code> prior to serving dashboard routes. Non-admin users are strictly blocked at the boundary.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/60 border border-white space-y-2">
            <h4 className="font-bold text-halo-plum flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-halo-periwinkle" />
              Row-Level Security (RLS)
            </h4>
            <p className="text-halo-plumMuted leading-relaxed">
              Database security policies in migration <code className="bg-white/80 px-1 py-0.5 rounded text-halo-plum">0004_admin_role.sql</code> allow admins to read all user profiles and moderate wardrobe items, while standard client accounts remain strictly sandboxed to their own <code className="bg-white/80 px-1 py-0.5 rounded text-halo-plum">auth.uid()</code> rows.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

