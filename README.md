# Indigo Crafted — Denim Pant E-Commerce Platform

A production-oriented, mobile-first e-commerce landing page built for Bangladeshi fashion apparel selling premium denim pants with Cash on Delivery (COD) payment flow.

Built with **React + TypeScript + Vite + Tailwind CSS**, backed by **Cloudflare Pages Functions** and **Cloudflare D1 (SQLite)**, with a local Express runtime for development in AI Studio.

---

## 👖 Product Offerings (Exactly Three)

1. **Black Denim Pant (`denim-black`)**
   - Color: Black
   - Sizes: S (28"-30"), M (31"-33"), L (34"-36")
   - Image: `/images/denim-black.webp`
2. **Light Blue Denim Pant (`denim-light-blue`)**
   - Color: Light Blue
   - Sizes: S (28"-30"), M (31"-33"), L (34"-36")
   - Image: `/images/denim-light-blue.webp`
3. **Black + Light Blue Denim Pant Combo (`denim-combo-black-light-blue`)**
   - Colors: Black + Light Blue (2-in-1 pack)
   - Sizes: S, M, L
   - Image: `/images/denim-combo-black-light-blue.webp`

---

## 🚀 Cloudflare Pages & D1 Deployment Guide

### Prerequisites
- Node.js 18+ installed
- Cloudflare account with Wrangler CLI (`npm install -g wrangler` or `npx wrangler`)

### Step 1: Create the Cloudflare D1 Database
Run in your terminal:
```bash
npx wrangler d1 create denim-store-db
```

Wrangler will output your database configuration:
```toml
[[d1_databases]]
binding = "DB"
database_name = "denim-store-db"
database_id = "99567ce9-f7e1-49d7-8596-1afcf7543591"
```

Copy the generated `database_id` and paste it into `wrangler.toml` replacing the placeholder.

### Step 2: Apply SQL Migrations to Cloudflare D1

Run the initial schema and seed migrations:
```bash
# Apply schema
npx wrangler d1 execute denim-store-db --remote --file=./migrations/0001_initial_schema.sql

# Seed initial products and settings
npx wrangler d1 execute denim-store-db --remote --file=./migrations/0002_seed_products.sql
```

### Step 3: Configure Cloudflare Pages Project

1. Log into your **Cloudflare Dashboard** > **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your repository.
3. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. In **Settings** > **Functions** > **D1 database bindings**:
   - Variable name: `DB`
   - D1 Database: Select `denim-store-db`
5. In **Settings** > **Environment variables**:
   - `ADMIN_BOOTSTRAP_USER`: `admin`
   - `ADMIN_BOOTSTRAP_PASSWORD`: `<your-secure-admin-password>`
   - `GTM_CONTAINER_ID`: `GTM-XXXXXXX` (or your real ID)
   - `GTM_ENABLED`: `false` (or `true`)
6. Click **Deploy**.

---

## 🛠️ Local Development (Node.js & AI Studio)

The development server uses Express with `node:sqlite` to mirror Cloudflare D1 behavior on port 3000:

```bash
# Start dev server
npm run dev

# Build production bundle
npm run build
```

---

## 🔐 Admin Dashboard Access

- URL: `/admin` (or click "এডমিন পোর্টাল" in the footer)
- Default bootstrap credentials:
  - Username: `admin`
  - Password: `admin12345`
- Note: Change password immediately in the Admin Dashboard Settings tab.

---

## 📊 Analytics & Google Tag Manager

Follow the complete step-by-step setup guide in [`docs/gtm-setup-guide.md`](docs/gtm-setup-guide.md).
Container ID placeholder: `GTM-XXXXXXX` (configured in `src/config/tracking.ts` or Admin Settings).
