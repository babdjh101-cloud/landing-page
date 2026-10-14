import { Env } from '../types';

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const productsRes = await env.DB.prepare(
      'SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC'
    ).all();

    const products = productsRes.results || [];
    const fullProducts = await Promise.all(
      products.map(async (p: any) => {
        const variantsRes = await env.DB.prepare(
          'SELECT id, size, stock_quantity, is_available FROM product_variants WHERE product_id = ?'
        )
          .bind(p.id)
          .all();
        return { ...p, variants: variantsRes.results || [] };
      })
    );

    return new Response(JSON.stringify({ success: true, data: fullProducts }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error loading products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
