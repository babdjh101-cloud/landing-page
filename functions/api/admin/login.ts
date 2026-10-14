import { Env } from '../../types';
import { verifyPassword, generateSessionToken, hashToken } from '../../../src/lib/crypto';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const { username, password }: any = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Username and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let admin: any = await env.DB.prepare('SELECT * FROM admin_users WHERE username = ?')
      .bind(username.trim())
      .first();

    if (!admin) {
      const countRow: any = await env.DB.prepare('SELECT COUNT(*) as count FROM admin_users').first();
      if (!countRow || countRow.count === 0) {
        const defaultUser = env.ADMIN_BOOTSTRAP_USER || 'admin';
        const defaultPass = env.ADMIN_BOOTSTRAP_PASSWORD || 'admin12345';
        if (username.trim() === defaultUser && password === defaultPass) {
          const { hashPasswordWithSalt } = await import('../../../src/lib/crypto');
          const { hashHex, saltHex } = await hashPasswordWithSalt(defaultPass);
          const ins = await env.DB.prepare('INSERT INTO admin_users (username, password_hash, salt) VALUES (?, ?, ?)')
            .bind(defaultUser, hashHex, saltHex)
            .run();
          admin = { id: ins.meta.last_row_id, username: defaultUser, password_hash: hashHex, salt: saltHex };
        }
      }
    }

    if (!admin) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isMatch = await verifyPassword(password, admin.password_hash, admin.salt);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid username or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = generateSessionToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
    )
      .bind(token.substring(0, 16), admin.id, tokenHash, expiresAt)
      .run();

    const cookie = `admin_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 3600}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: { token, user: { id: admin.id, username: admin.username } },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': cookie,
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Login error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
