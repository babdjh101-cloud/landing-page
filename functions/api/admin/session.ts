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

  return new Response(JSON.stringify({ success: true, data: { user: admin } }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
