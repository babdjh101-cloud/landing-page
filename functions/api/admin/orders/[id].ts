import { Env } from '../../../types';
import { verifyAdminRequest } from '../_auth';

export const onRequestGet = async ({ params, request, env }: { params: { id: string }; request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const orderId = params.id;
  const order: any = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
  if (!order) {
    return new Response(JSON.stringify({ success: false, error: 'Order not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(orderId).all();

  return new Response(JSON.stringify({ success: true, data: { ...order, items: items.results } }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const onRequestPatch = async ({ params, request, env }: { params: { id: string }; request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const orderId = params.id;
  const body: any = await request.json();
  const { order_status, admin_notes, cancellation_reason, payment_status, delivered_at } = body;

  const updates: string[] = ["updated_at = datetime('now')"];
  const queryParams: unknown[] = [];

  if (order_status) {
    updates.push('order_status = ?');
    queryParams.push(order_status);
  }
  if (admin_notes !== undefined) {
    updates.push('admin_notes = ?');
    queryParams.push(admin_notes);
  }
  if (cancellation_reason !== undefined) {
    updates.push('cancellation_reason = ?');
    queryParams.push(cancellation_reason);
  }
  if (payment_status) {
    updates.push('payment_status = ?');
    queryParams.push(payment_status);
  }
  if (delivered_at !== undefined) {
    updates.push('delivered_at = ?');
    queryParams.push(delivered_at);
  }

  queryParams.push(orderId);

  await env.DB.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).bind(...queryParams).run();

  const updated: any = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
  const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(orderId).all();

  return new Response(JSON.stringify({ success: true, data: { ...updated, items: items.results } }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
