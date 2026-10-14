import { Env } from '../../types';
import { hashToken } from '../../../src/lib/crypto';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const cookieHeader = request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (match) {
    const tokenHash = await hashToken(match[1]);
    await env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').bind(tokenHash).run();
  }

  return new Response(JSON.stringify({ success: true, message: 'Logged out' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'admin_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0',
    },
  });
};
