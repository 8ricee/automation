import { supabase } from '@/lib/supabase';
import { Tables } from '@/lib/supabase-types';

export type Quote = Tables['quotes'];
export type QuoteInsert = Omit<Quote, 'id' | 'created_at' | 'updated_at'>;
export type QuoteUpdate = Partial<QuoteInsert>;

// API functions for quotes
export const quoteApi = {
  // Get all quotes
  async getAll() {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get quote by ID with items
  async getById(id: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          name, email, company
        ),
        quote_items (
          *,
          products (
            name, sku, price
          )
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new quote
  async create(quote: QuoteInsert) {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quote])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update quote
  async update(id: string, updates: QuoteUpdate) {
    const { data, error } = await supabase
      .from('quotes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete quote
  async delete(id: string) {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Get quotes by status
  async getByStatus(status: Quote['status']) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update quote status
  async updateStatus(id: string, status: Quote['status']) {
    const { data, error } = await supabase
      .from('quotes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get expired quotes
  async getExpiredQuotes() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .lt('expiry_date', today)
      .eq('status', 'sent')
      .order('expiry_date');
    
    if (error) throw error;
    return data;
  },

  // Search quotes
  async search(query: string) {
    const { data, error } = await supabase
      .from('quotes')
      .select(`
        *,
        customers (
          name, email, company
        )
      `)
      .or(`quote_number.ilike.%${query}%,notes.ilike.%${query}%,customers.name.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Generate next quote number
  async generateNextQuoteNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `Q-${currentYear}-`;
    
    // Get the highest quote number for current year
    const { data, error } = await supabase
      .from('quotes')
      .select('quote_number')
      .like('quote_number', `${prefix}%`)
      .order('quote_number', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // First quote of the year
      return `${prefix}001`;
    }
    
    // Extract number from existing quote number
    const lastQuoteNumber = data[0].quote_number;
    const lastNumber = parseInt(lastQuoteNumber.replace(prefix, ''));
    const nextNumber = lastNumber + 1;
    
    // Format with leading zeros
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  },

  // Get quote statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('quotes')
      .select('id, status, total_amount');
    
    if (error) throw error;
    
    const stats = {
      total_quotes: data.length,
      total_value: 0,
      draft_quotes: 0,
      sent_quotes: 0,
      accepted_quotes: 0,
      rejected_quotes: 0,
      expired_quotes: 0
    };
    
    data.forEach(quote => {
      if (quote.total_amount) {
        stats.total_value += quote.total_amount;
      }
      
      switch (quote.status) {
        case 'draft':
          stats.draft_quotes++;
          break;
        case 'sent':
          stats.sent_quotes++;
          break;
        case 'accepted':
          stats.accepted_quotes++;
          break;
        case 'rejected':
          stats.rejected_quotes++;
          break;
        case 'expired':
          stats.expired_quotes++;
          break;
      }
    });
    
    return stats;
  }
};

// Export functions for quotes
export const quoteExportApi = {
  async exportToCSV() {
    const quotes = await quoteApi.getAll();
    const headers = [
      'ID', 'Số báo giá', 'Khách hàng', 'Trạng thái', 
      'Ngày tạo', 'Hạn sử dụng', 'Tổng tiền', 'Ghi chú'
    ];
    
    const csvContent = [
      headers.join(','),
      ...quotes.map(quote => [
        quote.id,
        quote.quote_number,
        quote.customers?.name || '',
        quote.status || '',
        quote.issue_date,
        quote.expiry_date || '',
        quote.total_amount || 0,
        quote.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};
