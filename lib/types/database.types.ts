export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type InventoryStatus = 'in_stock' | 'low_stock' | 'ordered' | 'discontinued'
export type UserRole = 'admin' | 'manager' | 'viewer'
export type ActivityAction = 'create' | 'update' | 'delete'

export interface Database {
  public: {
    Tables: {
      inventory_items: {
        Row: {
          id: string
          name: string
          description: string | null
          quantity: number
          category: string
          sku: string
          unit_price: number
          status: InventoryStatus
          low_stock_threshold: number
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          quantity: number
          category: string
          sku: string
          unit_price: number
          status?: InventoryStatus
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          quantity?: number
          category?: string
          sku?: string
          unit_price?: number
          status?: InventoryStatus
          low_stock_threshold?: number
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          created_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: ActivityAction
          item_id: string
          changes: Json
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          action: ActivityAction
          item_id: string
          changes: Json
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: ActivityAction
          item_id?: string
          changes?: Json
          timestamp?: string
        }
      }
    }
  }
}
