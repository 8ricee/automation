// src/utils/supabase/index.ts
// Main export file cho Supabase utilities

// Export client
export { supabase, getSupabaseClient, supabaseManager } from './client'

// Export config
export { supabaseConfig, validateSupabaseConfig, getEnvironment, isDebugMode } from './config'

// Export types
export type {
  Database,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
  SupabaseResponse,
  SupabaseListResponse,
  QueryOptions,
  FilterOptions,
  SearchOptions,
  PaginationOptions,
  PaginatedResponse,
} from './types'

// Re-export all types from supabase-types
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
} from './types'

// Export auth
export {
  authService,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  hasRole,
  login,
  register,
  logout,
  requestPasswordReset,
  updatePassword,
  updateProfile,
  subscribeToAuth,
} from './auth'

export type {
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  PasswordResetRequest,
} from './auth'
