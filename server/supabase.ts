// Supabase client for server-side operations
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../shared/supabase-types';

const supabaseUrl = process.env.SUPABASE_URL || process.env.DATABASE_URL?.replace('postgresql://', 'https://').replace(':5432/', '.supabase.co') || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Only create client if we have proper credentials
let supabase: ReturnType<typeof createClient<Database>> | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.log('Supabase credentials not found, using local storage fallback');
}

// Helper functions for the application
export class SupabaseService {
  
  async getCategories() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data;
  }

  async createCategory(category: { name: string; icon: string }) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCategory(id: number, updates: Partial<{ name: string; icon: string }>) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCategory(id: number) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getMenuItems() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('menu')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon
        )
      `)
      .order('id');
    
    if (error) throw error;
    return data;
  }

  async getMenuItemsByCategory(categoryId: number) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('menu')
      .select(`
        *,
        categories:category_id (
          id,
          name,
          icon
        )
      `)
      .eq('category_id', categoryId)
      .order('id');
    
    if (error) throw error;
    return data;
  }

  async createMenuItem(item: {
    name: string;
    description?: string;
    price: number;
    category_id: number;
    image?: string;
    available?: boolean;
  }) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('menu')
      .insert(item)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateMenuItem(id: number, updates: Partial<{
    name: string;
    description: string;
    price: number;
    category_id: number;
    image: string;
    available: boolean;
  }>) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('menu')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteMenuItem(id: number) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('menu')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getExtras() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('extras')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data;
  }

  async createExtra(extra: {
    name: string;
    price: number;
    categories?: string[];
  }) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('extras')
      .insert(extra)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateExtra(id: number, updates: Partial<{
    name: string;
    price: number;
    categories: string[];
  }>) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('extras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteExtra(id: number) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase
      .from('extras')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async getOrders() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getOrder(id: number) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createOrder(order: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    delivery_address: string;
    menu_items: any; // JSON object
    total_amount: number;
    payment_method?: string;
    transaction_hash?: string;
    payment_token?: string;
    discount_applied?: number;
    status?: string;
  }) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateOrder(id: number, updates: Partial<{
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    menu_items: any;
    total_amount: number;
    payment_method: string;
    transaction_hash: string;
    payment_token: string;
    discount_applied: number;
    status: string;
  }>) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();