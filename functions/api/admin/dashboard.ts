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
    const totalOrders: any = await env.DB.prepare('SELECT COUNT(*) as count FROM orders').first();
    const pendingOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'PENDING'").first();
    const confirmedOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'CONFIRMED'").first();
    const processingOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'PROCESSING'").first();
    const shippedOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'SHIPPED'").first();
    const deliveredOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'DELIVERED'").first();
    const cancelledOrders: any = await env.DB.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'CANCELLED'").first();

    const totalRevRow: any = await env.DB.prepare("SELECT SUM(total) as sum FROM orders WHERE order_status != 'CANCELLED'").first();
    const deliveredRevRow: any = await env.DB.prepare("SELECT SUM(total) as sum FROM orders WHERE order_status = 'DELIVERED'").first();

    const recentOrders = await env.DB.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_orders: totalOrders?.count || 0,
          pending_orders: pendingOrders?.count || 0,
          confirmed_orders: confirmedOrders?.count || 0,
          processing_orders: processingOrders?.count || 0,
          shipped_orders: shippedOrders?.count || 0,
          delivered_orders: deliveredOrders?.count || 0,
          cancelled_orders: cancelledOrders?.count || 0,
          total_revenue_bdt: totalRevRow?.sum || 0,
          delivered_revenue_bdt: deliveredRevRow?.sum || 0,
          recent_orders: recentOrders.results || [],
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
