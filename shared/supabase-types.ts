// TypeScript types for Supabase database
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: number;
          name: string;
          icon: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          icon: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          icon?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          image: string | null;
          category_id: number | null;
          available: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description?: string | null;
          price: number;
          image?: string | null;
          category_id?: number | null;
          available?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string | null;
          price?: number;
          image?: string | null;
          category_id?: number | null;
          available?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      extras: {
        Row: {
          id: number;
          name: string;
          price: number;
          categories: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          price: number;
          categories?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          price?: number;
          categories?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: number;
          customer_name: string;
          customer_email: string;
          customer_phone: string | null;
          delivery_address: string;
          menu_items: any; // JSON
          total_amount: number;
          payment_method: string | null;
          transaction_hash: string | null;
          payment_token: string | null;
          discount_applied: number | null;
          status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          customer_name: string;
          customer_email: string;
          customer_phone?: string | null;
          delivery_address: string;
          menu_items: any; // JSON
          total_amount: number;
          payment_method?: string | null;
          transaction_hash?: string | null;
          payment_token?: string | null;
          discount_applied?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string | null;
          delivery_address?: string;
          menu_items?: any; // JSON
          total_amount?: number;
          payment_method?: string | null;
          transaction_hash?: string | null;
          payment_token?: string | null;
          discount_applied?: number | null;
          status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}