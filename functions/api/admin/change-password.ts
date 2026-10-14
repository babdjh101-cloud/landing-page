import { Env } from '../../types';
import { verifyAdminRequest } from './_auth';
import { verifyPassword, hashPasswordWithSalt } from '../../../src/lib/crypto';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { currentPassword, newPassword }: any = await request.json();
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return new Response(JSON.stringify({ success: false, error: 'New password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userRow: any = await env.DB.prepare('SELECT * FROM admin_users WHERE id = ?').bind(admin.id).first();
    const isValid = await verifyPassword(currentPassword, userRow.password_hash, userRow.salt);

    if (!isValid) {
      return new Response(JSON.stringify({ success: false, error: 'Current password is incorrect' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { hashHex, saltHex } = await hashPasswordWithSalt(newPassword);

    await env.DB.prepare("UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(hashHex, saltHex, admin.id)
      .run();

    // Invalidate all sessions
    await env.DB.prepare('DELETE FROM admin_sessions WHERE admin_user_id = ?').bind(admin.id).run();

    return new Response(
      JSON.stringify({ success: true, message: 'Password updated. Please log in again.' }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': 'admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
