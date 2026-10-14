import { Env } from '../../types';

export const onRequestGet = async ({ params, env }: { params: { slug: string }; env: Env }) => {
  try {
    const slug = params.slug;
    const product = await env.DB.prepare(
      'SELECT * FROM products WHERE slug = ? AND is_active = 1'
    )
      .bind(slug)
      .first();

    if (!product) {
      return new Response(JSON.stringify({ success: false, error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const variantsRes = await env.DB.prepare(
      'SELECT id, size, stock_quantity, is_available FROM product_variants WHERE product_id = ?'
    )
      .bind((product as any).id)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        data: { ...product, variants: variantsRes.results || [] },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Error loading product' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
