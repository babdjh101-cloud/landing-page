import { Env } from '../types';
import { validateBangladeshiPhone, generatePublicOrderReference } from '../../src/lib/validation';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body: any = await request.json();
    const { customer_name, customer_phone, customer_address, district, area, notes, items, idempotency_key } = body;

    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'Customer name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const phoneCheck = validateBangladeshiPhone(customer_phone);
    if (!phoneCheck.isValid) {
      return new Response(JSON.stringify({ success: false, error: phoneCheck.error || 'Valid BD phone required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!customer_address || typeof customer_address !== 'string' || customer_address.trim().length < 5) {
      return new Response(JSON.stringify({ success: false, error: 'Full address required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Order items required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check idempotency
    if (idempotency_key) {
      const existing = await env.DB.prepare('SELECT * FROM orders WHERE idempotency_key = ?')
        .bind(idempotency_key)
        .first();

      if (existing) {
        const orderItems = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?')
          .bind((existing as any).id)
          .all();
        return new Response(
          JSON.stringify({
            success: true,
            data: { order: { ...existing, items: orderItems.results }, reference: (existing as any).public_order_reference },
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Delivery settings
    const insideDhakaSetting: any = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'delivery_inside_dhaka'").first();
    const outsideDhakaSetting: any = await env.DB.prepare("SELECT value FROM site_settings WHERE key = 'delivery_outside_dhaka'").first();
    const insideDhakaFee = insideDhakaSetting ? parseInt(insideDhakaSetting.value, 10) : 60;
    const outsideDhakaFee = outsideDhakaSetting ? parseInt(outsideDhakaSetting.value, 10) : 120;

    const isDhaka = (district || '').trim().toLowerCase() === 'dhaka';
    const deliveryCharge = isDhaka ? insideDhakaFee : outsideDhakaFee;

    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const dbProduct: any = await env.DB.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
        .bind(item.product_id)
        .first();

      if (!dbProduct) {
        return new Response(JSON.stringify({ success: false, error: `Product '${item.product_id}' unavailable` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const unitPrice = dbProduct.sale_price ?? dbProduct.price;
      const validSizes = ['S', 'M', 'L'];
      if (!validSizes.includes(item.size)) {
        return new Response(JSON.stringify({ success: false, error: `Invalid size ${item.size}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      verifiedItems.push({
        product_id: item.product_id,
        product_name_snapshot: dbProduct.name,
        size: item.size,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const total = subtotal + deliveryCharge;
    const publicRef = generatePublicOrderReference();

    const insertOrder = await env.DB.prepare(
      `INSERT INTO orders 
        (public_order_reference, customer_name, customer_phone, customer_address, district, area, notes, subtotal, delivery_charge, total, payment_method, payment_status, order_status, idempotency_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'UNPAID', 'PENDING', ?)`
    )
      .bind(
        publicRef,
        customer_name.trim(),
        phoneCheck.normalized,
        customer_address.trim(),
        district || 'Dhaka',
        area ? area.trim() : null,
        notes ? notes.trim() : null,
        subtotal,
        deliveryCharge,
        total,
        idempotency_key || null
      )
      .run();

    const orderId = insertOrder.meta.last_row_id;

    const itemStatements = verifiedItems.map((it) =>
      env.DB.prepare(
        `INSERT INTO order_items 
          (order_id, product_id, product_name_snapshot, size, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(orderId, it.product_id, it.product_name_snapshot, it.size, it.quantity, it.unit_price, it.line_total)
    );

    await env.DB.batch(itemStatements);

    const createdOrder = await env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(orderId).first();
    const createdItems = await env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(orderId).all();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          order: { ...(createdOrder as any), items: createdItems.results },
          reference: publicRef,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Order creation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
