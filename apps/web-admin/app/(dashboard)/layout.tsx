import { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { AdminHeader } from '@/components/layout/AdminHeader';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let adminName = 'Administrator';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.display_name) {
      adminName = profile.display_name;
    }
  }

  return (
    <div className="min-h-screen flex p-4 md:p-6 gap-6 max-w-[1600px] mx-auto">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          adminEmail={user?.email}
          adminName={adminName}
        />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}

