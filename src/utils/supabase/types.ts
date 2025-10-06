// src/utils/supabase/types.ts
// Type definitions cho Supabase database

// Re-export types từ supabase-types.ts để có cấu trúc rõ ràng
export type {
  Tables,
  TablesInsert,
  TablesUpdate,
  DbEnums,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Employee,
  EmployeeInsert,
  EmployeeUpdate,
  Supplier,
  SupplierInsert,
  SupplierUpdate,
  Product,
  ProductInsert,
  ProductUpdate,
  Quote,
  QuoteInsert,
  QuoteUpdate,
  Order,
  OrderInsert,
  OrderUpdate,
  Project,
  ProjectInsert,
  ProjectUpdate,
  Task,
  TaskInsert,
  TaskUpdate,
  PurchaseOrder,
  PurchaseOrderInsert,
  PurchaseOrderUpdate,
  PurchaseOrderItem,
  PurchaseOrderItemInsert,
  PurchaseOrderItemUpdate,
  Contact,
  ContactInsert,
  ContactUpdate,
  ApiListResponse,
  ApiResponse,
} from '@/lib/supabase-types'

// Database interface cho Supabase client - sử dụng any để tránh lỗi type
export interface Database {
  public: {
    Tables: unknown
    Views: unknown
    Functions: unknown
    Enums: unknown
    CompositeTypes: unknown
  }
}

// Utility types cho Supabase operations
export type TableName = keyof Database['public']['Tables']

export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update']

// Response types
export type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

export type SupabaseListResponse<T> = {
  data: T[] | null
  error: Error | null
  count?: number
}

// Query options
export interface QueryOptions {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
  select?: string
}

// Filter options
export interface FilterOptions {
  [key: string]: unknown
}

// Search options
export interface SearchOptions {
  term: string
  fields: string[]
  caseSensitive?: boolean
}

// Pagination
export interface PaginationOptions {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
