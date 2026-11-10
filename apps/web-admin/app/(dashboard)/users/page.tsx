import { createClient } from '@/lib/supabase/server';
import { UserTable, type UserProfile } from '@/components/users/UserTable';

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, display_name, gender, role, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-halo-plum tracking-tight">
          User Management
        </h1>
        <p className="text-sm text-halo-plumMuted mt-1">
          Review registered profiles, assign administrator privileges, and audit account access.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-halo-rose text-red-800 text-sm">
          Failed to load users: {error.message}
        </div>
      ) : (
        <UserTable
          initialUsers={(users as UserProfile[]) || []}
          currentAdminId={currentUser?.id || ''}
        />
      )}
    </div>
  );
}

