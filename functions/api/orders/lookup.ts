import { Env } from '../../types';
import { validateBangladeshiPhone } from '../../../src/lib/validation';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const { reference, phone }: any = await request.json();
    if (!reference || !phone) {
      return new Response(JSON.stringify({ success: false, error: 'Reference and phone required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const phoneCheck = validateBangladeshiPhone(phone);
    const lookupPhone = phoneCheck.isValid ? phoneCheck.normalized : phone.trim();

    const order: any = await env.DB.prepare(
      'SELECT * FROM orders WHERE UPPER(public_order_reference) = ? AND customer_phone = ?'
    )
      .bind(reference.trim().toUpperCase(), lookupPhone)
      .first();

    if (!order) {
      return new Response(JSON.stringify({ success: false, error: 'Order not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const items = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: { ...order, items: items.results },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Lookup error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
