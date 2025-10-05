import { BaseAPI, BaseEntity, APIError } from '@/lib/api/base-api';
import { Tables } from '@/lib/supabase-types';
import { supabase } from '@/utils/supabase';

export type Quote = Tables['quotes'];
export type QuoteInsert = Omit<Quote, 'id' | 'created_at' | 'updated_at'>;
export type QuoteUpdate = Partial<QuoteInsert>;

export class QuoteAPI extends BaseAPI<Quote, QuoteInsert, QuoteUpdate> {
  tableName = 'quotes';
  entityName = 'báo giá';

  // Override getAll to include customer information
  async getAll(): Promise<Quote[]> {
    try {
      console.log(`Fetching ${this.entityName} from Supabase...`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(`Successfully fetched ${this.entityName} from Supabase`);
      return (data || []) as unknown as Quote[];
    } catch (error) {
      console.error(`Supabase query failed for ${this.entityName}:`, error);
      throw new APIError(`Không thể tải dữ liệu ${this.entityName}`);
    }
  }

  // Override getById to include customer and items information
  async getById(id: string): Promise<Quote | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
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

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as unknown as Quote;
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by ID:`, error);
      throw new APIError(`Không thể tải thông tin ${this.entityName}`);
    }
  }

  // Additional quote-specific methods
  async getByStatus(status: Quote['status']): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Quote[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by status:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo trạng thái`);
    }
  }

  async getByCustomer(customerId: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Quote[];
    } catch (error) {
      console.error(`Failed to get ${this.entityName} by customer:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} theo khách hàng`);
    }
  }

  async updateStatus(id: string, status: Quote['status']): Promise<Quote> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Quote;
    } catch (error) {
      console.error(`Failed to update ${this.entityName} status:`, error);
      throw new APIError(`Không thể cập nhật trạng thái ${this.entityName}`);
    }
  }

  async getExpiredQuotes(): Promise<Quote[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from(this.tableName)
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
      return (data || []) as unknown as Quote[];
    } catch (error) {
      console.error(`Failed to get expired ${this.entityName}:`, error);
      throw new APIError(`Không thể lấy ${this.entityName} hết hạn`);
    }
  }

  async searchQuotes(query: string): Promise<Quote[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          customers (
            name, email, company
          )
        `)
        .or(`quote_number.ilike.%${query}%,notes.ilike.%${query}%,customers.name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Quote[];
    } catch (error) {
      console.error(`Failed to search ${this.entityName}:`, error);
      throw new APIError(`Không thể tìm kiếm ${this.entityName}`);
    }
  }

  async checkDuplicateQuoteNumber(quoteNumber: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('id')
        .eq('quote_number', quoteNumber);
      
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error(`Failed to check duplicate quote number:`, error);
      throw new APIError(`Không thể kiểm tra số báo giá trùng lặp`);
    }
  }

  async generateNextQuoteNumber(): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      const prefix = `Q-${currentYear}-`;
      
      // Get the highest quote number for current year
      const { data, error } = await supabase
        .from(this.tableName)
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
      const lastQuoteNumber = (data[0] as any).quote_number;
      const lastNumber = parseInt(lastQuoteNumber.replace(prefix, ''));
      const nextNumber = lastNumber + 1;
      
      // Format with leading zeros
      return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error(`Failed to generate next quote number:`, error);
      throw new APIError(`Không thể tạo số báo giá tiếp theo`);
    }
  }

  async getStatistics() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
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

      data.forEach((quote: any) => {
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
    } catch (error) {
      console.error('Error fetching quote statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const quoteApi = new QuoteAPI();

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
        (quote as any).customers?.name || '',
        quote.status || '',
        quote.quote_date,
        quote.expiry_date || '',
        quote.total_amount || 0,
        quote.notes || ''
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
};