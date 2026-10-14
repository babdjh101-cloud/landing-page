import { Env } from '../../types';
import { verifyAdminRequest } from './_auth';

export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rowsRes = await env.DB.prepare('SELECT key, value FROM site_settings').all();
  const rows = rowsRes.results || [];
  const settings: Record<string, any> = {};

  for (const r of rows as any[]) {
    if (r.key.includes('delivery') || r.key.includes('threshold')) {
      settings[r.key] = parseInt(r.value, 10) || 0;
    } else if (r.key === 'gtm_enabled') {
      settings[r.key] = r.value === 'true';
    } else {
      settings[r.key] = r.value;
    }
  }

  return new Response(JSON.stringify({ success: true, data: settings }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPatch = async ({ request, env }: { request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const incoming: any = await request.json();
  const statements = Object.entries(incoming).map(([key, val]) =>
    env.DB.prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    ).bind(key, String(val))
  );

  await env.DB.batch(statements);

  return new Response(JSON.stringify({ success: true, message: 'Settings saved' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
