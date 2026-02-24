-- This file contains seed data for testing
-- Note: You'll need to create users through Supabase dashboard or auth API first
-- Then update the UUIDs below with actual user IDs

-- Sample categories
-- Electronics, Office Supplies, Furniture, Hardware, Tools, Accessories

-- Insert sample inventory items (replace USER_ID_HERE with actual user UUIDs)
INSERT INTO inventory_items (name, description, quantity, category, sku, unit_price, status, low_stock_threshold, created_by) VALUES
-- Electronics
('MacBook Pro 16"', 'Latest M3 Max chip, 32GB RAM, 1TB SSD', 15, 'Electronics', 'ELEC-MBP16-001', 2999.00, 'in_stock', 5, 'USER_ID_HERE'),
('Dell Monitor 27"', '4K UHD display, USB-C connectivity', 8, 'Electronics', 'ELEC-MON27-002', 449.99, 'low_stock', 10, 'USER_ID_HERE'),
('Logitech Wireless Mouse', 'MX Master 3S, precision tracking', 45, 'Electronics', 'ELEC-MOUSE-003', 99.99, 'in_stock', 20, 'USER_ID_HERE'),
('USB-C Hub', '7-in-1 multiport adapter', 3, 'Electronics', 'ELEC-HUB-004', 49.99, 'low_stock', 15, 'USER_ID_HERE'),
('Wireless Keyboard', 'Mechanical, RGB backlit', 22, 'Electronics', 'ELEC-KEYB-005', 129.99, 'in_stock', 10, 'USER_ID_HERE'),

-- Office Supplies
('A4 Printer Paper', 'White, 500 sheets per ream', 120, 'Office Supplies', 'OFF-PAPER-001', 8.99, 'in_stock', 50, 'USER_ID_HERE'),
('Blue Ballpoint Pens', 'Pack of 12, medium point', 85, 'Office Supplies', 'OFF-PEN-002', 5.99, 'in_stock', 30, 'USER_ID_HERE'),
('Sticky Notes', 'Multi-color pack, 6 pads', 42, 'Office Supplies', 'OFF-STICK-003', 12.99, 'in_stock', 20, 'USER_ID_HERE'),
('File Folders', 'Letter size, manila, 100 count', 18, 'Office Supplies', 'OFF-FOLD-004', 24.99, 'in_stock', 10, 'USER_ID_HERE'),
('Staplers', 'Heavy duty, 50 sheet capacity', 6, 'Office Supplies', 'OFF-STAP-005', 18.99, 'low_stock', 10, 'USER_ID_HERE'),

-- Furniture
('Ergonomic Office Chair', 'Mesh back, lumbar support, adjustable', 12, 'Furniture', 'FURN-CHAIR-001', 299.99, 'in_stock', 5, 'USER_ID_HERE'),
('Standing Desk', 'Electric height adjustable, 60x30 inches', 0, 'Furniture', 'FURN-DESK-002', 599.99, 'ordered', 3, 'USER_ID_HERE'),
('Filing Cabinet', '4-drawer, locking, metal', 8, 'Furniture', 'FURN-FILE-003', 199.99, 'in_stock', 5, 'USER_ID_HERE'),
('Bookshelf', '5-tier, modern design, oak finish', 14, 'Furniture', 'FURN-SHELF-004', 149.99, 'in_stock', 8, 'USER_ID_HERE'),

-- Hardware
('Screwdriver Set', 'Precision, 32-piece kit', 28, 'Hardware', 'HARD-SCREW-001', 29.99, 'in_stock', 15, 'USER_ID_HERE'),
('Power Drill', 'Cordless, 20V, with battery', 11, 'Hardware', 'HARD-DRILL-002', 89.99, 'in_stock', 8, 'USER_ID_HERE'),
('Measuring Tape', '25ft, auto-lock, metric/imperial', 34, 'Hardware', 'HARD-TAPE-003', 12.99, 'in_stock', 20, 'USER_ID_HERE'),
('LED Work Light', 'Rechargeable, 1000 lumens', 7, 'Hardware', 'HARD-LIGHT-004', 39.99, 'low_stock', 10, 'USER_ID_HERE'),

-- Accessories
('Cable Management Kit', 'Clips, sleeves, and ties', 56, 'Accessories', 'ACC-CABLE-001', 19.99, 'in_stock', 25, 'USER_ID_HERE'),
('Laptop Stand', 'Aluminum, adjustable height', 19, 'Accessories', 'ACC-STAND-002', 44.99, 'in_stock', 15, 'USER_ID_HERE'),
('Webcam HD', '1080p, auto-focus, built-in mic', 9, 'Accessories', 'ACC-WEBCAM-003', 79.99, 'low_stock', 10, 'USER_ID_HERE');

-- Note: To use this seed data:
-- 1. Create test users in Supabase Auth (admin, manager, viewer)
-- 2. Get their user IDs from the auth.users table
-- 3. Replace 'USER_ID_HERE' with actual UUIDs
-- 4. Run this SQL in the Supabase SQL editor

-- Example query to get user IDs:
-- SELECT id, email FROM auth.users;

-- After replacing USER_ID_HERE, you can run:
-- DELETE FROM inventory_items; (to clear existing items)
-- Then run the INSERT statement above
