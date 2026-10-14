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

  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '15', 10)));
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM orders WHERE 1=1';
    const params: unknown[] = [];
    const countParams: unknown[] = [];

    if (status && status !== 'ALL') {
      query += ' AND order_status = ?';
      countQuery += ' AND order_status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (public_order_reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      countQuery += ' AND (public_order_reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const countRow: any = await env.DB.prepare(countQuery).bind(...countParams).first();
    const ordersRes = await env.DB.prepare(query).bind(...params).all();

    const orders = ordersRes.results || [];
    const ordersWithItems = await Promise.all(
      orders.map(async (o: any) => {
        const itemsRes = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(o.id).all();
        return { ...o, items: itemsRes.results || [] };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          orders: ordersWithItems,
          total: countRow?.count || 0,
          page,
          totalPages: Math.ceil((countRow?.count || 0) / limit),
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
