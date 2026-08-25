-- =========================================
-- Seed data for development
-- =========================================

TRUNCATE order_items, orders, cart_items, carts, products, users RESTART IDENTITY CASCADE;

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
  ('Wireless Mouse', 'Ergonomic wireless mouse with silent clicks', 24.99, 120, 'electronics', 'https://placehold.co/400x400?text=Mouse'),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard, blue switches', 79.50, 45, 'electronics', 'https://placehold.co/400x400?text=Keyboard'),
  ('USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 39.00, 80, 'electronics', 'https://placehold.co/400x400?text=Hub'),
  ('Laptop Stand', 'Adjustable aluminium laptop stand', 32.75, 60, 'accessories', 'https://placehold.co/400x400?text=Stand'),
  ('Noise Cancelling Headphones', 'Over-ear headphones with ANC, 30h battery', 149.99, 25, 'audio', 'https://placehold.co/400x400?text=Headphones'),
  ('Webcam 1080p', 'Full HD webcam with built-in microphone', 45.00, 70, 'electronics', 'https://placehold.co/400x400?text=Webcam'),
  ('Desk Lamp', 'LED desk lamp with adjustable colour temperature', 28.40, 90, 'home', 'https://placehold.co/400x400?text=Lamp'),
  ('Notebook A5', 'Hardcover dotted notebook, 200 pages', 12.00, 200, 'stationery', 'https://placehold.co/400x400?text=Notebook'),
  ('Water Bottle 1L', 'Insulated stainless steel water bottle', 18.99, 150, 'home', 'https://placehold.co/400x400?text=Bottle'),
  ('Phone Stand', 'Foldable aluminium phone stand', 9.99, 300, 'accessories', 'https://placehold.co/400x400?text=Phone+Stand');