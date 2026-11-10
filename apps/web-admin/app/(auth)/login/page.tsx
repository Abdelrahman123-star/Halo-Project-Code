'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { PearlButton } from '@/components/ui/PearlButton';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = searchParams.get('error') === 'unauthorized' 
    ? 'Access restricted. This account does not have admin permissions.' 
    : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Query the profile role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError || profile?.role !== 'admin') {
          // Sign out immediately if not admin
          await supabase.auth.signOut();
          setError('Access restricted. Your account is not authorized as an administrator.');
          setLoading(false);
          return;
        }

        // Successfully authenticated as admin
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred during login. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8 relative overflow-hidden">
        {/* Top subtle sheen */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-pearl-gradient" />

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-halo-periwinkle shadow-glass-sm mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-halo-plum tracking-tight">
            HALO Admin Portal
          </h1>
          <p className="text-sm text-halo-plumMuted mt-1.5">
            Sign in with an authorized administrator account
          </p>
        </div>

        {error ? (
          <div className="mb-6 p-3.5 rounded-xl bg-halo-rose/80 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-halo-plum mb-1.5 tracking-wide">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-halo-plumMuted/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@halo.app"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-halo-plum placeholder:text-halo-plumMuted/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-halo-plum mb-1.5 tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-halo-plumMuted/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm text-halo-plum placeholder:text-halo-plumMuted/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <PearlButton
              type="submit"
              size="lg"
              loading={loading}
              className="w-full shadow-md"
            >
              Sign In to Dashboard
            </PearlButton>
          </div>
        </form>

        <div className="mt-8 pt-4 border-t border-white/60 text-center">
          <p className="text-xs text-halo-plumMuted">
            HALO 3D Try-On & Virtual Wardrobe Platform
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4" />}>
      <LoginForm />
    </Suspense>
  );
}

