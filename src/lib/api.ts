/**
 * Unified Frontend API Client
 * Interacts with /api/* routes backed by SQLite/D1
 */

import { Product, Order, AdminDashboardStats, SiteSettings, CartItem, CheckoutFormData, OrderStatus } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Pass HttpOnly session cookies
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        success: false,
        error: json?.error || `Request failed with status ${res.status}`,
      };
    }

    return json as ApiResponse<T>;
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error occurred. Please check connection.',
    };
  }
}

// Public Storefront APIs
export async function getProducts(): Promise<ApiResponse<Product[]>> {
  return request<Product[]>('/products');
}

export async function getProduct(slug: string): Promise<ApiResponse<Product>> {
  return request<Product>(`/products/${encodeURIComponent(slug)}`);
}

export async function submitOrder(
  formData: CheckoutFormData,
  items: CartItem[]
): Promise<ApiResponse<{ order: Order; reference: string }>> {
  return request<{ order: Order; reference: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      ...formData,
      items: items.map((it) => ({
        product_id: it.product_id,
        size: it.size,
        quantity: it.quantity,
      })),
    }),
  });
}

export async function lookupOrder(reference: string, phone: string): Promise<ApiResponse<Order>> {
  return request<Order>('/orders/lookup', {
    method: 'POST',
    body: JSON.stringify({ reference, phone }),
  });
}

// Admin APIs
export async function adminLogin(username: string, password: string): Promise<ApiResponse<{ token: string; user: { id: number; username: string } }>> {
  return request<{ token: string; user: { id: number; username: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function adminLogout(): Promise<ApiResponse<null>> {
  return request<null>('/admin/logout', { method: 'POST' });
}

export async function getAdminSession(): Promise<ApiResponse<{ user: { id: number; username: string } }>> {
  return request<{ user: { id: number; username: string } }>('/admin/session');
}

export async function getAdminDashboard(): Promise<ApiResponse<AdminDashboardStats>> {
  return request<AdminDashboardStats>('/admin/dashboard');
}

export async function getAdminOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ orders: Order[]; total: number; page: number; totalPages: number }>> {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  return request<{ orders: Order[]; total: number; page: number; totalPages: number }>(`/admin/orders?${query.toString()}`);
}

export async function getAdminOrder(id: number): Promise<ApiResponse<Order>> {
  return request<Order>(`/admin/orders/${id}`);
}

export async function updateAdminOrderStatus(
  id: number,
  data: {
    order_status?: OrderStatus;
    admin_notes?: string;
    cancellation_reason?: string;
    delivered_at?: string;
    payment_status?: string;
  }
): Promise<ApiResponse<Order>> {
  return request<Order>(`/admin/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAdminProducts(): Promise<ApiResponse<Product[]>> {
  return request<Product[]>('/admin/products');
}

export async function updateAdminProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
  return request<Product>(`/admin/products/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getAdminSettings(): Promise<ApiResponse<SiteSettings>> {
  return request<SiteSettings>('/admin/settings');
}

export async function updateAdminSettings(settings: Partial<SiteSettings>): Promise<ApiResponse<SiteSettings>> {
  return request<SiteSettings>('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<ApiResponse<null>> {
  return request<null>('/admin/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
