-- Fix: Delete trigger causing foreign key constraint violation
-- Problem: Trigger was logging AFTER delete, when item no longer exists
-- Solution: Use BEFORE DELETE trigger so item still exists when logging

-- Drop the existing trigger
DROP TRIGGER IF EXISTS log_inventory_changes ON inventory_items;

-- Recreate the function with proper handling for each operation
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_logs (user_id, action, item_id, changes)
    VALUES (
      current_user_id,
      'create',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'quantity', NEW.quantity, 'sku', NEW.sku)
    );
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
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

    IF changes_json != '{}'::jsonb THEN
      INSERT INTO activity_logs (user_id, action, item_id, changes)
      VALUES (current_user_id, 'update', NEW.id, changes_json);
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    -- Log deletion BEFORE the item is actually deleted
    INSERT INTO activity_logs (user_id, action, item_id, changes)
    VALUES (
      current_user_id,
      'delete',
      OLD.id,
      jsonb_build_object('name', OLD.name, 'sku', OLD.sku)
    );
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create separate triggers for better control
-- AFTER trigger for INSERT and UPDATE
CREATE TRIGGER log_inventory_insert_update
  AFTER INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();

-- BEFORE trigger for DELETE (so item still exists when logging)
CREATE TRIGGER log_inventory_delete
  BEFORE DELETE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();

-- Verify triggers were created
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'inventory_items'
ORDER BY trigger_name;
