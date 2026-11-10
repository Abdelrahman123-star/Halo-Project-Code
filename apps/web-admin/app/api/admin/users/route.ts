import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

type VerifyAdminResult =
  | { authorized: false; response: NextResponse }
  | {
      authorized: true;
      user: { id: string; email?: string };
      supabase: Awaited<ReturnType<typeof createClient>>;
    };

async function verifyAdmin(): Promise<VerifyAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role !== 'admin') {
    return { authorized: false, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { authorized: true, user, supabase };
}

export async function PATCH(request: NextRequest) {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) return authCheck.response;

  try {
    const body = await request.json();
    const { action, userId, displayName, gender, role, password, email } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (action === 'update_profile') {
      const updates: Record<string, unknown> = {};
      if (typeof displayName === 'string') updates.display_name = displayName.trim();
      if (gender === 'female' || gender === 'male' || gender === null) updates.gender = gender;
      if (role === 'user' || role === 'admin') updates.role = role;

      const { error } = await authCheck.supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: 'Profile updated successfully' });
    }

    if (action === 'update_password') {
      if (!password || password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
      }

      const adminClient = getAdminClient();
      if (!adminClient) {
        return NextResponse.json(
          {
            error:
              'Direct password change requires SUPABASE_SERVICE_ROLE_KEY in apps/web-admin/.env.local (from Supabase Dashboard -> Settings -> API). You can use "Send Password Reset Email" instead.',
          },
          { status: 400 },
        );
      }

      const { error } = await adminClient.auth.admin.updateUserById(userId, { password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: 'User password successfully updated' });
    }

    if (action === 'send_reset_email') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
      }

      const { error } = await authCheck.supabase.auth.resetPasswordForEmail(email.trim());
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, message: `Password reset email sent to ${email}` });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) return authCheck.response;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    if (userId === authCheck.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });
    }

    const adminClient = getAdminClient();
    if (adminClient) {
      await adminClient.auth.admin.deleteUser(userId);
    }

    const { error } = await authCheck.supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'User account successfully deleted' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
