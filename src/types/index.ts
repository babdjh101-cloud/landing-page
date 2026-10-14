export type DenimSize = 'S' | 'M' | 'L';

export interface ProductVariant {
  id: number;
  product_id: string;
  size: DenimSize;
  stock_quantity: number;
  is_available: number;
}

export interface Product {
  id: string; // e.g. 'denim-black'
  slug: string;
  name: string;
  description: string;
  color: string;
  price: number; // in integer BDT
  sale_price: number | null; // in integer BDT
  image_path: string;
  is_active: number;
  badge?: string | null;
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  cart_item_id: string; // e.g. `${productId}_${size}`
  product_id: string;
  product_name: string;
  color: string;
  size: DenimSize;
  unit_price: number; // BDT integer snapshot
  quantity: number;
  image_path: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  product_name_snapshot: string;
  size: DenimSize;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  public_order_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  district: string;
  area?: string | null;
  notes?: string | null;
  subtotal: number;
  delivery_charge: number;
  total: number;
  payment_method: 'COD';
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  idempotency_key?: string | null;
  admin_notes?: string | null;
  cancellation_reason?: string | null;
  delivered_at?: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface CheckoutFormData {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  district: string;
  area: string;
  notes: string;
  idempotency_key?: string;
}

export interface SiteSettings {
  store_name: string;
  store_tagline: string;
  store_phone: string;
  store_email: string;
  store_address: string;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_threshold: number;
  announcement_text: string;
  gtm_container_id: string;
  gtm_enabled: boolean;
}

export interface AdminUser {
  id: number;
  username: string;
}

export interface AdminDashboardStats {
  total_orders: number;
  pending_orders: number;
  confirmed_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue_bdt: number; // delivered + confirmed + shipped + processing
  delivered_revenue_bdt: number;
  recent_orders: Order[];
}

export interface AuditLog {
  id: number;
  admin_user_id: number;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: string | null;
  created_at: string;
}
