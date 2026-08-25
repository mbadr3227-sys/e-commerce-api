-- =========================================
-- Seed data for development
-- =========================================

TRUNCATE order_items, orders, cart_items, carts, products, users RESTART IDENTITY CASCADE;

INSERT INTO products (name, description, price, stock, category, image_url) VALUES
  ('Wireless Mouse', 'Ergonomic wireless mouse with silent clicks', 24.99, 120, 'electronics', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop'),
  ('Mechanical Keyboard', 'RGB backlit mechanical keyboard, blue switches', 79.50, 45, 'electronics', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI and card reader', 39.00, 80, 'electronics', '/images/usb-hub.jpg'),
    ('Laptop Stand', 'Adjustable aluminium laptop stand', 32.75, 60, 'accessories', '/images/laptop-stand.jpg'),
  ('Noise Cancelling Headphones', 'Over-ear headphones with ANC, 30h battery', 149.99, 25, 'audio', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop'),
    ('Webcam 1080p', 'Full HD webcam with built-in microphone', 45.00, 70, 'electronics', '/images/webcam.jpg'),
  ('Desk Lamp', 'LED desk lamp with adjustable colour temperature', 28.40, 90, 'home', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop'),
  ('Notebook A5', 'Hardcover dotted notebook, 200 pages', 12.00, 200, 'stationery', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&h=400&fit=crop'),
  ('Water Bottle 1L', 'Insulated stainless steel water bottle', 18.99, 150, 'home', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop'),
    ('Phone Stand', 'Foldable aluminium phone stand', 9.99, 300, 'accessories', '/images/phone-stand.jpg');