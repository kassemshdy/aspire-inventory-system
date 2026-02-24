-- Improved seed script that works with triggers
-- This script temporarily disables the activity logging trigger during seeding

-- Step 1: Get admin user ID (you'll need to replace this manually)
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@test.com'
  LIMIT 1;

  -- If no admin user found, raise an error
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Admin user not found. Please create admin@test.com first.';
  END IF;

  -- Temporarily disable the trigger
  ALTER TABLE inventory_items DISABLE TRIGGER log_inventory_changes;

  -- Insert seed data
  INSERT INTO inventory_items (name, description, quantity, category, sku, unit_price, status, low_stock_threshold, created_by) VALUES
  -- Electronics
  ('MacBook Pro 16"', 'Latest M3 Max chip, 32GB RAM, 1TB SSD', 15, 'Electronics', 'ELEC-MBP16-001', 2999.00, 'in_stock', 5, admin_user_id),
  ('Dell Monitor 27"', '4K UHD display, USB-C connectivity', 8, 'Electronics', 'ELEC-MON27-002', 449.99, 'low_stock', 10, admin_user_id),
  ('Logitech Wireless Mouse', 'MX Master 3S, precision tracking', 45, 'Electronics', 'ELEC-MOUSE-003', 99.99, 'in_stock', 20, admin_user_id),
  ('USB-C Hub', '7-in-1 multiport adapter', 3, 'Electronics', 'ELEC-HUB-004', 49.99, 'low_stock', 15, admin_user_id),
  ('Wireless Keyboard', 'Mechanical, RGB backlit', 22, 'Electronics', 'ELEC-KEYB-005', 129.99, 'in_stock', 10, admin_user_id),

  -- Office Supplies
  ('A4 Printer Paper', 'White, 500 sheets per ream', 120, 'Office Supplies', 'OFF-PAPER-001', 8.99, 'in_stock', 50, admin_user_id),
  ('Blue Ballpoint Pens', 'Pack of 12, medium point', 85, 'Office Supplies', 'OFF-PEN-002', 5.99, 'in_stock', 30, admin_user_id),
  ('Sticky Notes', 'Multi-color pack, 6 pads', 42, 'Office Supplies', 'OFF-STICK-003', 12.99, 'in_stock', 20, admin_user_id),
  ('File Folders', 'Letter size, manila, 100 count', 18, 'Office Supplies', 'OFF-FOLD-004', 24.99, 'in_stock', 10, admin_user_id),
  ('Staplers', 'Heavy duty, 50 sheet capacity', 6, 'Office Supplies', 'OFF-STAP-005', 18.99, 'low_stock', 10, admin_user_id),

  -- Furniture
  ('Ergonomic Office Chair', 'Mesh back, lumbar support, adjustable', 12, 'Furniture', 'FURN-CHAIR-001', 299.99, 'in_stock', 5, admin_user_id),
  ('Standing Desk', 'Electric height adjustable, 60x30 inches', 0, 'Furniture', 'FURN-DESK-002', 599.99, 'low_stock', 3, admin_user_id),
  ('Filing Cabinet', '4-drawer, locking, metal', 8, 'Furniture', 'FURN-FILE-003', 199.99, 'in_stock', 5, admin_user_id),
  ('Bookshelf', '5-tier, modern design, oak finish', 14, 'Furniture', 'FURN-SHELF-004', 149.99, 'in_stock', 8, admin_user_id),

  -- Hardware
  ('Screwdriver Set', 'Precision, 32-piece kit', 28, 'Hardware', 'HARD-SCREW-001', 29.99, 'in_stock', 15, admin_user_id),
  ('Power Drill', 'Cordless, 20V, with battery', 11, 'Hardware', 'HARD-DRILL-002', 89.99, 'in_stock', 8, admin_user_id),
  ('Measuring Tape', '25ft, auto-lock, metric/imperial', 34, 'Hardware', 'HARD-TAPE-003', 12.99, 'in_stock', 20, admin_user_id),
  ('LED Work Light', 'Rechargeable, 1000 lumens', 7, 'Hardware', 'HARD-LIGHT-004', 39.99, 'low_stock', 10, admin_user_id),

  -- Accessories
  ('Cable Management Kit', 'Clips, sleeves, and ties', 56, 'Accessories', 'ACC-CABLE-001', 19.99, 'in_stock', 25, admin_user_id),
  ('Laptop Stand', 'Aluminum, adjustable height', 19, 'Accessories', 'ACC-STAND-002', 44.99, 'in_stock', 15, admin_user_id),
  ('Webcam HD', '1080p, auto-focus, built-in mic', 9, 'Accessories', 'ACC-WEBCAM-003', 79.99, 'low_stock', 10, admin_user_id);

  -- Re-enable the trigger
  ALTER TABLE inventory_items ENABLE TRIGGER log_inventory_changes;

  -- Show success message
  RAISE NOTICE 'Seed data inserted successfully! Total items: %', (SELECT COUNT(*) FROM inventory_items);
END $$;

-- Verify the data
SELECT
  category,
  COUNT(*) as item_count,
  SUM(quantity) as total_quantity,
  SUM(quantity * unit_price) as total_value
FROM inventory_items
GROUP BY category
ORDER BY category;
