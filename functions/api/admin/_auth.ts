import { Env } from '../../types';
import { hashToken } from '../../../src/lib/crypto';

export async function verifyAdminRequest(request: Request, env: Env): Promise<{ id: number; username: string } | null> {
  const cookieHeader = request.headers.get('Cookie') || '';
  let token = '';

  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (match) {
    token = match[1];
  } else {
    const auth = request.headers.get('Authorization');
    if (auth?.startsWith('Bearer ')) {
      token = auth.substring(7);
    }
  }

  if (!token) return null;

  const tokenHash = await hashToken(token);
  const now = new Date().toISOString();

  const session: any = await env.DB.prepare(
    `SELECT s.id, s.admin_user_id, s.expires_at, u.username 
     FROM admin_sessions s 
     JOIN admin_users u ON s.admin_user_id = u.id 
     WHERE s.token_hash = ? AND s.expires_at > ?`
  )
    .bind(tokenHash, now)
    .first();

  if (!session) return null;

  return { id: session.admin_user_id, username: session.username };
}
