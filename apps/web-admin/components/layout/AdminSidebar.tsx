'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Shirt,
  Activity,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/wardrobe', label: 'Wardrobe & CV', icon: Shirt },
  { href: '/system', label: 'System Health', icon: Activity },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 p-4 hidden md:flex flex-col gap-6">
      {/* Brand Header */}
      <div className="px-3 py-2 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-pearl-gradient flex items-center justify-center text-halo-plum shadow-glass-sm border border-white">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-halo-plum block leading-tight">
            HALO
          </span>
          <span className="text-[11px] font-semibold tracking-wider text-halo-plumMuted uppercase">
            Admin Console
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 select-none',
                isActive
                  ? 'bg-white/90 text-halo-plum shadow-glass-sm border border-halo-periwinkle/30'
                  : 'text-halo-plumMuted hover:text-halo-plum hover:bg-white/50',
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4',
                  isActive ? 'text-halo-periwinkle' : 'text-halo-plumMuted/80',
                )}
              />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-halo-periwinkle shadow-sm" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="mt-auto px-3 py-3 glass-panel-subtle rounded-xl text-xs text-halo-plumMuted">
        <p className="font-semibold text-halo-plum">HALO Platform v0.1</p>
        <p className="text-[11px] opacity-80 mt-0.5">CV Fashion Pipeline</p>
      </div>
    </aside>
  );
}

