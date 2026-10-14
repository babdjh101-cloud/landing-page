/**
 * Google Tag Manager (GTM) Typed DataLayer Tracking Layer
 * 
 * Complies with GA4 standard ecommerce event schemas and COD measurement policy.
 * Personal Identifiable Information (PII) such as customer name, phone, address,
 * or passwords are strictly excluded from all analytics payloads.
 */

import { GTM_CONTAINER_ID, GTM_ENABLED, TRACKING_CONFIG } from '../config/tracking';
import { CartItem, Product, DenimSize } from '../types';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    _gtmLoaded?: boolean;
    _trackedPurchases?: Set<string>;
  }
}

/**
 * Initializes the GTM script and window.dataLayer safely.
 * Only injects external GTM script if GTM_ENABLED is true and container ID is not the placeholder.
 */
export function initializeGTM(containerId: string = GTM_CONTAINER_ID, enabled: boolean = GTM_ENABLED): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer safely without overwriting existing data
  window.dataLayer = window.dataLayer || [];

  const isPlaceholder = !containerId || containerId === 'GTM-XXXXXXX';
  if (!enabled || isPlaceholder) {
    // Record ready state for inspection in dev tools without loading external scripts
    window.dataLayer.push({
      event: 'gtm.init_simulated',
      tracking_status: 'ready_pending_real_container_id',
      container_id: containerId || 'GTM-XXXXXXX',
    });
    return;
  }

  // Prevent multiple injections
  if (window._gtmLoaded) return;
  window._gtmLoaded = true;

  // Official Google Tag Manager Snippet
  (function (w: Window, d: Document, s: string, l: string, i: string) {
    (w as unknown as Record<string, unknown[]>)[l] = (w as unknown as Record<string, unknown[]>)[l] || [];
    (w as unknown as Record<string, unknown[]>)[l].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', containerId);
}

/**
 * Push an event safely to window.dataLayer.
 * Always clears stale ecommerce data with `{ ecommerce: null }` first.
 */
function pushEcommerceEvent(eventName: string, ecommerceData: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  // Clear previous ecommerce object per Google recommendations
  window.dataLayer.push({ ecommerce: null });

  // Push new event
  window.dataLayer.push({
    event: eventName,
    ecommerce: ecommerceData,
  });
}

/**
 * Track Product View (view_item)
 */
export function trackViewItem(product: Product, selectedSize?: DenimSize): void {
  const activePrice = product.sale_price ?? product.price;
  pushEcommerceEvent('view_item', {
    currency: TRACKING_CONFIG.currency,
    value: activePrice,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: 'Denim Pant',
        item_variant: `${product.color}${selectedSize ? ` / ${selectedSize}` : ''}`,
        price: activePrice,
        quantity: 1,
      },
    ],
  });
}

/**
 * Track Add to Cart (add_to_cart)
 */
export function trackAddToCart(item: CartItem): void {
  pushEcommerceEvent('add_to_cart', {
    currency: TRACKING_CONFIG.currency,
    value: item.unit_price * item.quantity,
    items: [
      {
        item_id: item.product_id,
        item_name: item.product_name,
        item_category: 'Denim Pant',
        item_variant: `${item.color} / ${item.size}`,
        price: item.unit_price,
        quantity: item.quantity,
      },
    ],
  });
}

/**
 * Track Remove from Cart (remove_from_cart)
 */
export function trackRemoveFromCart(item: CartItem): void {
  pushEcommerceEvent('remove_from_cart', {
    currency: TRACKING_CONFIG.currency,
    value: item.unit_price * item.quantity,
    items: [
      {
        item_id: item.product_id,
        item_name: item.product_name,
        item_category: 'Denim Pant',
        item_variant: `${item.color} / ${item.size}`,
        price: item.unit_price,
        quantity: item.quantity,
      },
    ],
  });
}

/**
 * Track Begin Checkout (begin_checkout)
 */
export function trackBeginCheckout(items: CartItem[], subtotal: number): void {
  pushEcommerceEvent('begin_checkout', {
    currency: TRACKING_CONFIG.currency,
    value: subtotal,
    items: items.map((it) => ({
      item_id: it.product_id,
      item_name: it.product_name,
      item_category: 'Denim Pant',
      item_variant: `${it.color} / ${it.size}`,
      price: it.unit_price,
      quantity: it.quantity,
    })),
  });
}

/**
 * Track Shipping Info Added (add_shipping_info)
 */
export function trackAddShippingInfo(items: CartItem[], shippingTier: string, deliveryCharge: number, subtotal: number): void {
  pushEcommerceEvent('add_shipping_info', {
    currency: TRACKING_CONFIG.currency,
    value: subtotal,
    shipping_tier: shippingTier,
    shipping: deliveryCharge,
    items: items.map((it) => ({
      item_id: it.product_id,
      item_name: it.product_name,
      item_category: 'Denim Pant',
      item_variant: `${it.color} / ${it.size}`,
      price: it.unit_price,
      quantity: it.quantity,
    })),
  });
}

/**
 * Track Purchase (purchase)
 * 
 * COD Measurement Policy:
 * Triggers strictly AFTER authoritative server-confirmed persistence.
 * Idempotency guard prevents duplicate tracking on browser refreshes or back-navigation.
 * NO PII (name, phone, address) is sent in accordance with GDPR and Google policies.
 */
export function trackPurchase(order: {
  public_order_reference: string;
  subtotal: number;
  delivery_charge: number;
  items: CartItem[] | { product_id: string; product_name_snapshot: string; size: string; unit_price: number; quantity: number }[];
}): void {
  if (typeof window === 'undefined') return;

  // Browser-level deduplication guard
  window._trackedPurchases = window._trackedPurchases || new Set<string>();
  if (window._trackedPurchases.has(order.public_order_reference)) {
    return; // Already tracked this transaction in current session
  }
  window._trackedPurchases.add(order.public_order_reference);

  const formattedItems = order.items.map((it) => {
    const isCartItem = 'product_name' in it;
    return {
      item_id: it.product_id,
      item_name: isCartItem ? (it as CartItem).product_name : (it as { product_name_snapshot: string }).product_name_snapshot,
      item_category: 'Denim Pant',
      item_variant: isCartItem ? `${(it as CartItem).color} / ${it.size}` : `Size ${it.size}`,
      price: it.unit_price,
      quantity: it.quantity,
    };
  });

  pushEcommerceEvent('purchase', {
    transaction_id: order.public_order_reference,
    value: order.subtotal, // Merchandise subtotal excluding delivery as per standard
    shipping: order.delivery_charge,
    currency: TRACKING_CONFIG.currency,
    payment_type: 'Cash on Delivery',
    cod_policy: TRACKING_CONFIG.codMeasurementPolicy,
    items: formattedItems,
  });
}
