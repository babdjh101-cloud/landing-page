import { Env } from '../../../types';
import { verifyAdminRequest } from '../_auth';
import { validateImagePath } from '../../../../src/lib/validation';

export const onRequestPatch = async ({ params, request, env }: { params: { id: string }; request: Request; env: Env }) => {
  const admin = await verifyAdminRequest(request, env);
  if (!admin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = params;
  const body: any = await request.json();
  const { name, description, price, sale_price, image_path, is_active } = body;

  if (image_path && !validateImagePath(image_path)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid or unsafe image path' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await env.DB.prepare(
    `UPDATE products SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      price = COALESCE(?, price),
      sale_price = ?,
      image_path = COALESCE(?, image_path),
      is_active = COALESCE(?, is_active),
      updated_at = datetime('now')
     WHERE id = ?`
  )
    .bind(
      name || null,
      description || null,
      price !== undefined ? Number(price) : null,
      sale_price !== undefined ? (sale_price === null ? null : Number(sale_price)) : null,
      image_path || null,
      is_active !== undefined ? Number(is_active) : null,
      id
    )
    .run();

  const updated = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
  return new Response(JSON.stringify({ success: true, data: updated }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
