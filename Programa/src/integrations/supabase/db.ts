// Typed access layer for the inventory tables (products, inventory_movements,
// user_roles). It wraps the generated client without modifying it.
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./client";

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  cost: number;
  unit: string;
  sku: string | null;
  image_key: string | null;
  stock: number;
  min_stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MovementRow {
  id: string;
  product_id: string;
  delta: number;
  kind: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Table<Row, Insert = Partial<Row>, Update = Partial<Row>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface InventoryDatabase {
  public: {
    Tables: {
      products: Table<
        ProductRow,
        Omit<ProductRow, "created_at" | "updated_at"> &
          Partial<Pick<ProductRow, "created_at" | "updated_at">>
      >;
      inventory_movements: Table<
        MovementRow,
        Pick<MovementRow, "product_id" | "delta"> &
          Partial<Omit<MovementRow, "product_id" | "delta">>
      >;
      user_roles: Table<
        UserRoleRow,
        Pick<UserRoleRow, "user_id" | "role"> & Partial<UserRoleRow>
      >;
      orders: Table<{
        id: string;
        user_id: string;
        status: string;
        address: string;
        phone: string | null;
        notes: string | null;
        subtotal: number;
        shipping: number;
        total: number;
        created_at: string;
      }>;
      order_items: Table<{
        id: string;
        order_id: string;
        product_id: string;
        product_name: string;
        unit_price: number;
        qty: number;
        created_at: string;
      }>;
      profiles: Table<{
        id: string;
        display_name: string;
        phone: string | null;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: string };
        Returns: boolean;
      };
      claim_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export const db = supabase as unknown as SupabaseClient<
  InventoryDatabase,
  "public"
>;
