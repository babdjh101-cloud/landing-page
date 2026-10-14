import express, { Request, Response, NextFunction } from 'express';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import { hashPasswordWithSalt, verifyPassword, generateSessionToken, hashToken } from './src/lib/crypto';
import { validateBangladeshiPhone, validateImagePath, generatePublicOrderReference } from './src/lib/validation';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const isProd = process.env.NODE_ENV === 'production';
const DB_FILE = path.join(__dirname, 'denim_store.db');

// Initialize SQLite database
const db = new DatabaseSync(DB_FILE);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Run migrations
function runMigrations() {
  const m1Path = path.join(__dirname, 'migrations', '0001_initial_schema.sql');
  const m2Path = path.join(__dirname, 'migrations', '0002_seed_products.sql');

  if (fs.existsSync(m1Path)) {
    const m1Sql = fs.readFileSync(m1Path, 'utf8');
    db.exec(m1Sql);
  }

  if (fs.existsSync(m2Path)) {
    const m2Sql = fs.readFileSync(m2Path, 'utf8');
    db.exec(m2Sql);
  }
}

// Bootstrap initial admin if none exists
async function bootstrapAdmin() {
  const check = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as { count: number };
  if (check.count === 0) {
    const defaultUser = process.env.ADMIN_BOOTSTRAP_USER || 'admin';
    const defaultPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'admin12345';
    const { hashHex, saltHex } = await hashPasswordWithSalt(defaultPass);
    db.prepare('INSERT INTO admin_users (username, password_hash, salt) VALUES (?, ?, ?)').run(
      defaultUser,
      hashHex,
      saltHex
    );
    console.log(`[Bootstrap] Initial admin created: ${defaultUser}`);
  }
}

runMigrations();
bootstrapAdmin().catch(console.error);

const app = express();

app.use(express.json());
app.use(cookieParser());

// Rate-limiting in-memory store for sensitive endpoints (login, orders)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown_ip';
    const key = `${req.path}_${ip}`;
    const now = Date.now();

    const record = rateLimitMap.get(key);
    if (!record || record.resetAt < now) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({ success: false, error: 'Too many requests. Please slow down.' });
    }

    record.count++;
    next();
  };
}

// Admin Authentication Middleware
async function authenticateAdmin(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.cookies?.admin_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!sessionToken) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session missing' });
  }

  const tokenHash = await hashToken(sessionToken);
  const now = new Date().toISOString();

  const session = db
    .prepare(
      `SELECT s.id, s.admin_user_id, s.expires_at, u.username 
       FROM admin_sessions s 
       JOIN admin_users u ON s.admin_user_id = u.id 
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .get(tokenHash, now) as { id: string; admin_user_id: number; expires_at: string; username: string } | undefined;

  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Session invalid or expired' });
  }

  (req as Request & { adminUser?: { id: number; username: string } }).adminUser = {
    id: session.admin_user_id,
    username: session.username,
  };

  next();
}

// --------------------------------------------------------------------------
// Public API Routes
// --------------------------------------------------------------------------

// 1. Get Products
app.get('/api/products', (_req, res) => {
  try {
    const products = db
      .prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC')
      .all() as Record<string, unknown>[];

    const result = products.map((p) => {
      const variants = db
        .prepare('SELECT id, size, stock_quantity, is_available FROM product_variants WHERE product_id = ?')
        .all(p.id as string);
      return { ...p, variants };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, error: 'Failed to load products' });
  }
});

// 2. Get Single Product by Slug
app.get('/api/products/:slug', (req, res) => {
  try {
    const product = db
      .prepare('SELECT * FROM products WHERE slug = ? AND is_active = 1')
      .get(req.params.slug) as Record<string, unknown> | undefined;

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const variants = db
      .prepare('SELECT id, size, stock_quantity, is_available FROM product_variants WHERE product_id = ?')
      .all(product.id as string);

    res.json({ success: true, data: { ...product, variants } });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ success: false, error: 'Failed to load product' });
  }
});

// 3. Create Cash on Delivery Order (Server-Authoritative Pricing & Idempotency)
app.post('/api/orders', rateLimiter(15, 60000), (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, district, area, notes, items, idempotency_key } = req.body;

    // Validate inputs
    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    const phoneCheck = validateBangladeshiPhone(customer_phone);
    if (!phoneCheck.isValid) {
      return res.status(400).json({ success: false, error: phoneCheck.error || 'Valid BD phone is required' });
    }

    if (!customer_address || typeof customer_address !== 'string' || customer_address.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Complete delivery address is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one product item is required' });
    }

    // Check idempotency
    if (idempotency_key) {
      const existing = db
        .prepare('SELECT * FROM orders WHERE idempotency_key = ?')
        .get(idempotency_key) as Record<string, unknown> | undefined;

      if (existing) {
        const orderItems = db
          .prepare('SELECT * FROM order_items WHERE order_id = ?')
          .all(existing.id as number);
        return res.json({
          success: true,
          data: { order: { ...existing, items: orderItems }, reference: existing.public_order_reference },
        });
      }
    }

    // Fetch site delivery settings
    const insideDhakaSetting = db.prepare("SELECT value FROM site_settings WHERE key = 'delivery_inside_dhaka'").get() as { value: string } | undefined;
    const outsideDhakaSetting = db.prepare("SELECT value FROM site_settings WHERE key = 'delivery_outside_dhaka'").get() as { value: string } | undefined;
    const insideDhakaFee = insideDhakaSetting ? parseInt(insideDhakaSetting.value, 10) : 60;
    const outsideDhakaFee = outsideDhakaSetting ? parseInt(outsideDhakaSetting.value, 10) : 120;

    const isDhaka = (district || '').trim().toLowerCase() === 'dhaka';
    const deliveryCharge = isDhaka ? insideDhakaFee : outsideDhakaFee;

    // Server-Authoritative Pricing & Item Snapshot Calculation
    let calculatedSubtotal = 0;
    const verifiedOrderItems: Array<{
      product_id: string;
      product_name_snapshot: string;
      size: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    for (const item of items) {
      const dbProduct = db
        .prepare('SELECT * FROM products WHERE id = ? AND is_active = 1')
        .get(item.product_id) as Record<string, unknown> | undefined;

      if (!dbProduct) {
        return res.status(400).json({ success: false, error: `Product '${item.product_id}' is unavailable` });
      }

      const unitPrice = (dbProduct.sale_price as number | null) ?? (dbProduct.price as number);
      if (!unitPrice || unitPrice <= 0) {
        return res.status(400).json({ success: false, error: `Price not configured for ${dbProduct.name}` });
      }

      const validSizes = ['S', 'M', 'L'];
      if (!validSizes.includes(item.size)) {
        return res.status(400).json({ success: false, error: `Invalid size ${item.size}` });
      }

      const qty = Math.max(1, Math.min(10, parseInt(item.quantity, 10) || 1));
      const lineTotal = unitPrice * qty;
      calculatedSubtotal += lineTotal;

      verifiedOrderItems.push({
        product_id: item.product_id,
        product_name_snapshot: dbProduct.name as string,
        size: item.size,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    const grandTotal = calculatedSubtotal + deliveryCharge;
    const publicRef = generatePublicOrderReference();

    // Transactional write
    db.exec('BEGIN TRANSACTION;');

    try {
      const insertOrder = db.prepare(
        `INSERT INTO orders 
          (public_order_reference, customer_name, customer_phone, customer_address, district, area, notes, subtotal, delivery_charge, total, payment_method, payment_status, order_status, idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'COD', 'UNPAID', 'PENDING', ?)`
      );

      const orderResult = insertOrder.run(
        publicRef,
        customer_name.trim(),
        phoneCheck.normalized,
        customer_address.trim(),
        district || 'Dhaka',
        area ? area.trim() : null,
        notes ? notes.trim() : null,
        calculatedSubtotal,
        deliveryCharge,
        grandTotal,
        idempotency_key || null
      );

      const orderId = orderResult.lastInsertRowid;

      const insertItem = db.prepare(
        `INSERT INTO order_items 
          (order_id, product_id, product_name_snapshot, size, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      for (const it of verifiedOrderItems) {
        insertItem.run(
          orderId,
          it.product_id,
          it.product_name_snapshot,
          it.size,
          it.quantity,
          it.unit_price,
          it.line_total
        );
      }

      db.exec('COMMIT;');

      const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Record<string, unknown>;
      const createdItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

      res.status(201).json({
        success: true,
        data: {
          order: { ...createdOrder, items: createdItems },
          reference: publicRef,
        },
      });
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ success: false, error: 'Database persistence error while creating order' });
  }
});

// 4. Privacy-Preserving Public Order Lookup
app.post('/api/orders/lookup', rateLimiter(20, 60000), (req, res) => {
  try {
    const { reference, phone } = req.body;
    if (!reference || !phone) {
      return res.status(400).json({ success: false, error: 'Order reference and phone number required' });
    }

    const phoneCheck = validateBangladeshiPhone(phone);
    const lookupPhone = phoneCheck.isValid ? phoneCheck.normalized : phone.trim();

    const order = db
      .prepare('SELECT * FROM orders WHERE UPPER(public_order_reference) = ? AND customer_phone = ?')
      .get(reference.trim().toUpperCase(), lookupPhone) as Record<string, unknown> | undefined;

    if (!order) {
      return res.status(404).json({ success: false, error: 'Matching order not found' });
    }

    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id as number);

    res.json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (err) {
    console.error('Error looking up order:', err);
    res.status(500).json({ success: false, error: 'Error looking up order' });
  }
});

// --------------------------------------------------------------------------
// Admin Authentication & Session Routes
// --------------------------------------------------------------------------

// Admin Login
app.post('/api/admin/login', rateLimiter(8, 60000), async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const admin = db
      .prepare('SELECT * FROM admin_users WHERE username = ?')
      .get(username.trim()) as { id: number; username: string; password_hash: string; salt: string } | undefined;

    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const isMatch = await verifyPassword(password, admin.password_hash, admin.salt);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    // Create session token
    const token = generateSessionToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    db.prepare(
      'INSERT INTO admin_sessions (id, admin_user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)'
    ).run(token.substring(0, 16), admin.id, tokenHash, expiresAt);

    // Set secure HttpOnly cookie
    res.cookie('admin_session', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      success: true,
      data: {
        token,
        user: { id: admin.id, username: admin.username },
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: 'Internal login error' });
  }
});

// Admin Logout
app.post('/api/admin/logout', async (req, res) => {
  const sessionToken = req.cookies?.admin_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (sessionToken) {
    const tokenHash = await hashToken(sessionToken);
    db.prepare('DELETE FROM admin_sessions WHERE token_hash = ?').run(tokenHash);
  }
  res.clearCookie('admin_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Admin Session Check
app.get('/api/admin/session', authenticateAdmin, (req, res) => {
  const user = (req as Request & { adminUser?: { id: number; username: string } }).adminUser;
  res.json({ success: true, data: { user } });
});

// Admin Dashboard Overview Stats
app.get('/api/admin/dashboard', authenticateAdmin, (_req, res) => {
  try {
    const totalOrders = (db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number }).count;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'PENDING'").get() as { count: number }).count;
    const confirmedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'CONFIRMED'").get() as { count: number }).count;
    const processingOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'PROCESSING'").get() as { count: number }).count;
    const shippedOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'SHIPPED'").get() as { count: number }).count;
    const deliveredOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'DELIVERED'").get() as { count: number }).count;
    const cancelledOrders = (db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'CANCELLED'").get() as { count: number }).count;

    const totalRevRow = db.prepare("SELECT SUM(total) as sum FROM orders WHERE order_status != 'CANCELLED'").get() as { sum: number | null };
    const deliveredRevRow = db.prepare("SELECT SUM(total) as sum FROM orders WHERE order_status = 'DELIVERED'").get() as { sum: number | null };

    const recentOrders = db.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT 5').all();

    res.json({
      success: true,
      data: {
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        confirmed_orders: confirmedOrders,
        processing_orders: processingOrders,
        shipped_orders: shippedOrders,
        delivered_orders: deliveredOrders,
        cancelled_orders: cancelledOrders,
        total_revenue_bdt: totalRevRow.sum || 0,
        delivered_revenue_bdt: deliveredRevRow.sum || 0,
        recent_orders: recentOrders,
      },
    });
  } catch (err) {
    console.error('Error fetching admin dashboard:', err);
    res.status(500).json({ success: false, error: 'Dashboard error' });
  }
});

// Admin Orders List & Filter
app.get('/api/admin/orders', authenticateAdmin, (req, res) => {
  try {
    const { status, search, page = '1', limit = '15' } = req.query;
    const p = Math.max(1, parseInt(page as string, 10));
    const lim = Math.max(1, Math.min(100, parseInt(limit as string, 10)));
    const offset = (p - 1) * lim;

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

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (public_order_reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      countQuery += ' AND (public_order_reference LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      params.push(term, term, term);
      countParams.push(term, term, term);
    }

    query += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(lim, offset);

    const countRow = db.prepare(countQuery).get(...(countParams as any[])) as { count: number };
    const orders = db.prepare(query).all(...(params as any[])) as Record<string, unknown>[];

    const ordersWithItems = orders.map((o) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id as number);
      return { ...o, items };
    });

    res.json({
      success: true,
      data: {
        orders: ordersWithItems,
        total: countRow.count,
        page: p,
        totalPages: Math.ceil(countRow.count / lim),
      },
    });
  } catch (err) {
    console.error('Error listing orders:', err);
    res.status(500).json({ success: false, error: 'Error listing orders' });
  }
});

// Admin Order Details
app.get('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id) as Record<string, unknown> | undefined;
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id as number);
    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error getting order' });
  }
});

// Admin Update Order Status
app.patch('/api/admin/orders/:id', authenticateAdmin, (req, res) => {
  try {
    const orderId = req.params.id;
    const { order_status, admin_notes, cancellation_reason, payment_status, delivered_at } = req.body;

    const existing = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Record<string, unknown> | undefined;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const updates: string[] = ["updated_at = datetime('now')"];
    const params: unknown[] = [];

    if (order_status) {
      updates.push('order_status = ?');
      params.push(order_status);
    }
    if (admin_notes !== undefined) {
      updates.push('admin_notes = ?');
      params.push(admin_notes);
    }
    if (cancellation_reason !== undefined) {
      updates.push('cancellation_reason = ?');
      params.push(cancellation_reason);
    }
    if (payment_status) {
      updates.push('payment_status = ?');
      params.push(payment_status);
    }
    if (delivered_at !== undefined) {
      updates.push('delivered_at = ?');
      params.push(delivered_at);
    }

    params.push(orderId);

    db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).run(...(params as any[]));

    const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Record<string, unknown>;
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(Number(orderId));

    res.json({ success: true, data: { ...updated, items } });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

// Admin Products List
app.get('/api/admin/products', authenticateAdmin, (_req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY id ASC').all();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

// Admin Update Product
app.patch('/api/admin/products/:id', authenticateAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, sale_price, image_path, is_active } = req.body;

    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (image_path && !validateImagePath(image_path)) {
      return res.status(400).json({ success: false, error: 'Invalid or unsafe image path' });
    }

    db.prepare(
      `UPDATE products SET 
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        sale_price = ?,
        image_path = COALESCE(?, image_path),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      name || null,
      description || null,
      price !== undefined ? Number(price) : null,
      sale_price !== undefined ? (sale_price === null ? null : Number(sale_price)) : null,
      image_path || null,
      is_active !== undefined ? Number(is_active) : null,
      id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, error: 'Failed to update product' });
  }
});

// Admin Settings
app.get('/api/admin/settings', authenticateAdmin, (_req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all() as Array<{ key: string; value: string }>;
    const settings: Record<string, unknown> = {};
    for (const r of rows) {
      if (r.key.includes('delivery') || r.key.includes('threshold')) {
        settings[r.key] = parseInt(r.value, 10) || 0;
      } else if (r.key === 'gtm_enabled') {
        settings[r.key] = r.value === 'true';
      } else {
        settings[r.key] = r.value;
      }
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch settings' });
  }
});

app.patch('/api/admin/settings', authenticateAdmin, (req, res) => {
  try {
    const incoming = req.body;
    const upsert = db.prepare(
      "INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
    );

    for (const [key, val] of Object.entries(incoming)) {
      upsert.run(key, String(val));
    }

    res.json({ success: true, message: 'Settings updated' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ success: false, error: 'Failed to save settings' });
  }
});

// Admin Change Password
app.post('/api/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const user = (req as Request & { adminUser?: { id: number; username: string } }).adminUser!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }

    const admin = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(user.id) as { password_hash: string; salt: string };
    const isValid = await verifyPassword(currentPassword, admin.password_hash, admin.salt);

    if (!isValid) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' });
    }

    const { hashHex, saltHex } = await hashPasswordWithSalt(newPassword);

    db.prepare("UPDATE admin_users SET password_hash = ?, salt = ?, updated_at = datetime('now') WHERE id = ?").run(
      hashHex,
      saltHex,
      user.id
    );

    // Invalidate all existing sessions after password change
    db.prepare('DELETE FROM admin_sessions WHERE admin_user_id = ?').run(user.id);
    res.clearCookie('admin_session', { path: '/' });

    res.json({ success: true, message: 'Password updated. Please log in again.' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
});

// --------------------------------------------------------------------------
// Dev / Static Server Setup
// --------------------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Denim E-Commerce Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
