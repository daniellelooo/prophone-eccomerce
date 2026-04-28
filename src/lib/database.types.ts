// AUTO-GENERATED — regenerar con MCP Supabase generate_typescript_types.
// No editar a mano.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customer_addresses: {
        Row: {
          address: string
          city: string
          created_at: string
          department: string
          full_name: string
          id: string
          is_default: boolean
          label: string | null
          notes: string | null
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          department: string
          full_name: string
          id?: string
          is_default?: boolean
          label?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          department?: string
          full_name?: string
          id?: string
          is_default?: boolean
          label?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price_cop: number
          variant_label: string | null
          variant_sku: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price_cop: number
          variant_label?: string | null
          variant_sku?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price_cop?: number
          variant_label?: string | null
          variant_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          shipping_address: string | null
          shipping_city: string | null
          shipping_cop: number
          shipping_department: string | null
          status: string
          subtotal_cop: number
          total_cop: number
          updated_at: string
          user_id: string | null
          whatsapp_sent: boolean
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cop?: number
          shipping_department?: string | null
          status?: string
          subtotal_cop: number
          total_cop: number
          updated_at?: string
          user_id?: string | null
          whatsapp_sent?: boolean
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_cop?: number
          shipping_department?: string | null
          status?: string
          subtotal_cop?: number
          total_cop?: number
          updated_at?: string
          user_id?: string | null
          whatsapp_sent?: boolean
        }
        Relationships: []
      }
      product_images: {
        Row: {
          color: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category: string
          colors: Json
          created_at: string
          description: string
          family: string | null
          features: Json
          id: string
          image: string
          is_featured: boolean
          is_new: boolean
          name: string
          short_description: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          colors?: Json
          created_at?: string
          description?: string
          family?: string | null
          features?: Json
          id: string
          image?: string
          is_featured?: boolean
          is_new?: boolean
          name: string
          short_description?: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          colors?: Json
          created_at?: string
          description?: string
          family?: string | null
          features?: Json
          id?: string
          image?: string
          is_featured?: boolean
          is_new?: boolean
          name?: string
          short_description?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          is_admin: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          is_admin?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sedes: {
        Row: {
          area: string
          detail: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          area?: string
          detail?: string
          id: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          area?: string
          detail?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      variants: {
        Row: {
          color: string | null
          condition: string
          created_at: string
          in_stock: boolean
          notes: string | null
          price_cop: number
          product_id: string
          ram: string | null
          size: string | null
          sku: string
          sort_order: number
          storage: string | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          condition: string
          created_at?: string
          in_stock?: boolean
          notes?: string | null
          price_cop: number
          product_id: string
          ram?: string | null
          size?: string | null
          sku: string
          sort_order?: number
          storage?: string | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          condition?: string
          created_at?: string
          in_stock?: boolean
          notes?: string | null
          price_cop?: number
          product_id?: string
          ram?: string | null
          size?: string | null
          sku?: string
          sort_order?: number
          storage?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
