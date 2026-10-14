# Google Tag Manager (GTM) Setup & GA4 Ecommerce Tracking Guide

This application provides a production-grade, typed dataLayer implementation adhering to the official Google Analytics 4 (GA4) ecommerce schema and Bangladeshi Cash on Delivery (COD) measurement practices.

---

## 1. How to Create a GTM Container

1. Navigate to [Google Tag Manager](https://tagmanager.google.com/) and sign in with your Google account.
2. Click **Create Account**.
3. Set your Account Name (e.g., `Indigo Crafted Denim`).
4. Set Country to `Bangladesh`.
5. Enter your Container Name (e.g., `indigocrafted.com`).
6. Select **Web** as the Target Platform.
7. Click **Create** and accept the Terms of Service.
8. Your container ID will look like `GTM-XXXXXXX`.

---

## 2. Where to Replace `GTM-XXXXXXX`

There are two ways to configure the real container ID:

### Option A: Via the Admin Dashboard UI (Recommended)
1. Go to the Admin Portal (`/admin`).
2. Log in with your admin credentials.
3. Open the **স্টোর সেটিংস ও সিকিউরিটি** tab.
4. Enter your real GTM ID in **GTM Container ID**.
5. Check **GTM ট্র্যাকিং সক্রিয় করুন**.
6. Click **সেটিংস সেভ করুন**.

### Option B: In the Source Code
1. Open `src/config/tracking.ts`.
2. Replace `GTM_CONTAINER_ID = 'GTM-XXXXXXX'` with your real container ID (e.g., `GTM-A1B2C3D`).
3. Set `GTM_ENABLED = true`.
4. In `wrangler.toml` (for Cloudflare deployment), set:
   ```toml
   [vars]
   GTM_CONTAINER_ID = "GTM-A1B2C3D"
   GTM_ENABLED = "true"
   ```

---

## 3. How to Configure the Google Tag in GTM

1. Inside GTM, click **Tags** > **New**.
2. Name the tag: `Google Tag - GA4 Config`.
3. Tag Configuration: choose **Google Tag**.
4. In **Tag ID**, enter your GA4 Measurement ID (`G-XXXXXXXXXX`).
5. Triggering: choose **Initialization - All Pages**.
6. Click **Save**.

---

## 4. How to Configure GA4 Ecommerce Event Tags

Create a reusable GA4 Event Tag:
1. In GTM, click **Tags** > **New**.
2. Name: `GA4 - Ecommerce Events`.
3. Tag Type: **Google Analytics: GA4 Event**.
4. Measurement ID: enter `{{GA4 Measurement ID}}` or your `G-XXXXXXXXXX`.
5. Event Name: enter `{{Event}}` (Built-in Variable for custom events).
6. Under **More Settings** > **Ecommerce**:
   - Check **Send Ecommerce data**.
   - Data Source: **Data Layer**.
7. Triggering: Add the Custom Event Triggers created in Step 5.
8. Click **Save**.

---

## 5. How to Create Custom Event Triggers

Create a single trigger or individual triggers:

- Trigger Type: **Custom Event**.
- Event Name: `view_item|add_to_cart|remove_from_cart|begin_checkout|add_shipping_info|purchase`
- Check **Use regex matching**.
- Fired On: **All Custom Events**.

---

## 6. How to Configure the `purchase` Event

The application pushes the `purchase` event only **after** the order has been transactionally persisted in the SQLite/D1 database:

```javascript
window.dataLayer.push({ ecommerce: null }); // Clears previous state
window.dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'BD-8K92F',
    value: 2190, // Merchandise subtotal excluding delivery
    shipping: 60,
    currency: 'BDT',
    payment_type: 'Cash on Delivery',
    cod_policy: 'ORDER_PLACED_UNPAID_COD',
    items: [
      {
        item_id: 'denim-combo-black-light-blue',
        item_name: 'Black + Light Blue Denim Pant Combo',
        item_category: 'Denim Pant',
        item_variant: 'Black + Light Blue / M',
        price: 2190,
        quantity: 1
      }
    ]
  }
});
```

### Cash on Delivery (COD) Measurement Policy
- The `purchase` event measures confirmed customer order placement with payment status `UNPAID`.
- Courier cash collection occurs upon door-to-door delivery.
- Personal Identifiable Information (customer name, phone number, delivery address) is **strictly excluded** from dataLayer payloads in accordance with Google Policies and privacy standards.

---

## 7. How to Test Events with GTM Preview, Tag Assistant, and GA4 DebugView

1. In GTM, click the **Preview** button in the top right.
2. Enter your site URL and click **Connect**.
3. In Tag Assistant, perform user actions:
   - Click sizes: verifies `view_item`.
   - Click "ব্যাগে যোগ করুন": verifies `add_to_cart`.
   - Fill out checkout form and click "ক্যাশ অন ডেলিভারিতে অর্ডার নিশ্চিত করুন": verifies `purchase`.
4. In GA4, open **Admin** > **DebugView** to see events in real-time.

---

## 8. How to Avoid Duplicate Purchase Counting

1. **Client-side Session Guard**: `src/lib/tracking.ts` maintains an in-memory `window._trackedPurchases` set containing completed order references. Refreshing or back-navigating will not re-trigger `trackPurchase`.
2. **Server-side Idempotency**: Checkout requests send an `idempotency_key` that prevents duplicate order creation in D1.

---

## 9. How to Test the Site with GTM Disabled

When `GTM_ENABLED` is false or the container ID is `GTM-XXXXXXX`:
- External GTM script tags are **not** loaded.
- `window.dataLayer` continues to capture all events safely without errors.
- You can open browser Developer Tools > Console and inspect `window.dataLayer` at any time to verify event payloads and structure.
