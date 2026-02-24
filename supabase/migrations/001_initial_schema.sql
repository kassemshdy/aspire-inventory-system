-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'viewer');
CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'ordered', 'discontinued');
CREATE TYPE activity_action AS ENUM ('create', 'update', 'delete');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'viewer',
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  category TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  status inventory_status NOT NULL DEFAULT 'in_stock',
  low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Activity logs table
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action activity_action NOT NULL,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_created_by ON inventory_items(created_by);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_item_id ON activity_logs(item_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);

-- Function to auto-update inventory status based on quantity
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-update status if it's not manually set to 'ordered' or 'discontinued'
  IF NEW.status NOT IN ('ordered', 'discontinued') THEN
    IF NEW.quantity = 0 THEN
      NEW.status := 'low_stock';
    ELSIF NEW.quantity <= NEW.low_stock_threshold THEN
      NEW.status := 'low_stock';
    ELSE
      NEW.status := 'in_stock';
    END IF;
  END IF;

  -- Always update the updated_at timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the status update function
CREATE TRIGGER inventory_status_update
  BEFORE INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_item_status();

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
  current_user_id UUID;
BEGIN
  -- Get current user from the session
  current_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (user_id, action, item_id, changes)
    VALUES (
      current_user_id,
      'create',
      NEW.id,
      jsonb_build_object(
        'name', NEW.name,
        'quantity', NEW.quantity,
        'sku', NEW.sku
      )
    );
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build changes object with only modified fields
    changes_json := jsonb_build_object();

    IF OLD.name != NEW.name THEN
      changes_json := changes_json || jsonb_build_object('name', jsonb_build_object('old', OLD.name, 'new', NEW.name));
    END IF;

    IF OLD.quantity != NEW.quantity THEN
      changes_json := changes_json || jsonb_build_object('quantity', jsonb_build_object('old', OLD.quantity, 'new', NEW.quantity));
    END IF;

    IF OLD.status != NEW.status THEN
      changes_json := changes_json || jsonb_build_object('status', jsonb_build_object('old', OLD.status, 'new', NEW.status));
    END IF;

    IF OLD.unit_price != NEW.unit_price THEN
      changes_json := changes_json || jsonb_build_object('unit_price', jsonb_build_object('old', OLD.unit_price, 'new', NEW.unit_price));
    END IF;

    -- Only log if there were actual changes
    IF changes_json != '{}'::jsonb THEN
      INSERT INTO activity_logs (user_id, action, item_id, changes)
      VALUES (current_user_id, 'update', NEW.id, changes_json);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_logs (user_id, action, item_id, changes)
    VALUES (
      current_user_id,
      'delete',
      OLD.id,
      jsonb_build_object(
        'name', OLD.name,
        'sku', OLD.sku
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log changes
CREATE TRIGGER log_inventory_changes
  AFTER INSERT OR UPDATE OR DELETE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for inventory_items
CREATE POLICY "Anyone authenticated can view inventory items"
  ON inventory_items FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Managers and admins can insert items"
  ON inventory_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers and admins can update items"
  ON inventory_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Only admins can delete items"
  ON inventory_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for activity_logs
CREATE POLICY "Anyone authenticated can view activity logs"
  ON activity_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'viewer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
