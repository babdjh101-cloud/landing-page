-- Migration 0002: Seed Initial Products, Variants, and Site Settings

INSERT OR IGNORE INTO products (id, slug, name, description, color, price, sale_price, image_path, is_active, badge)
VALUES
(
  'denim-black',
  'denim-black',
  'Black Denim Pant',
  'Premium jet-black twill denim crafted with 98% combed cotton and 2% elastane for maximum comfort and flexibility. Deep sulfur-dyeing prevents wash fading. Features durable reinforced pocket rivets, tailored slim-straight cut, and breathable all-season weight (12.5 oz).',
  'Black',
  1550,
  1250,
  '/images/denim-black.webp',
  1,
  'BESTSELLER'
),
(
  'denim-light-blue',
  'denim-light-blue',
  'Light Blue Denim Pant',
  'Classic vintage stonewashed light blue denim pant with natural fading and subtle whiskers. Built from authentic ring-spun denim cotton with high tensile strength. Tailored modern slim fit designed for the Bangladeshi climate with anti-chafing inner seams.',
  'Light Blue',
  1550,
  1250,
  '/images/denim-light-blue.webp',
  1,
  'POPULAR'
),
(
  'denim-combo-black-light-blue',
  'denim-combo-black-light-blue',
  'Black + Light Blue Denim Pant Combo',
  'Exclusive 2-in-1 combo package featuring both our signature Black Denim Pant and Light Blue Denim Pant. Get complete wardrobe versatility covering formal, semi-casual, and weekend outings while enjoying massive combo bundle savings and priority shipping.',
  'Black + Light Blue',
  3100,
  2190,
  '/images/denim-combo-black-light-blue.webp',
  1,
  'MEGA SAVINGS'
);

-- Seed Variants for all 3 products (S, M, L)
INSERT OR IGNORE INTO product_variants (product_id, size, stock_quantity, is_available) VALUES
('denim-black', 'S', 45, 1),
('denim-black', 'M', 60, 1),
('denim-black', 'L', 38, 1),
('denim-light-blue', 'S', 40, 1),
('denim-light-blue', 'M', 55, 1),
('denim-light-blue', 'L', 35, 1),
('denim-combo-black-light-blue', 'S', 30, 1),
('denim-combo-black-light-blue', 'M', 50, 1),
('denim-combo-black-light-blue', 'L', 25, 1);

-- Seed Site Settings
INSERT OR IGNORE INTO site_settings (key, value) VALUES
('store_name', 'Indigo Crafted'),
('store_tagline', 'হাতে তৈরি প্রিমিয়াম ডেনিম প্যান্ট'),
('store_phone', '+880 1700-000000'),
('store_email', 'contact@indigocrafted.com'),
('store_address', 'House 14, Road 11, Banani, Dhaka-1213, Bangladesh'),
('delivery_inside_dhaka', '60'),
('delivery_outside_dhaka', '120'),
('free_delivery_threshold', '0'),
('announcement_text', '🔥 সীমিত সময়ের অফার: কম্বো প্যাকেজে ৯১০৳ পর্যন্ত ছাড়! সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা।'),
('gtm_container_id', 'GTM-XXXXXXX'),
('gtm_enabled', 'false');

-- Seed Initial Admin User (admin / admin12345)
INSERT OR IGNORE INTO admin_users (id, username, password_hash, salt) VALUES
(1, 'admin', 'c4ba8168359109611774021625ec6f34a32f3709ce3b6beb44b4a1f0a90502b7', 'c24e16700f1c1ab11483b90ffd00e507');
