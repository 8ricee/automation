"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createCustomerColumns } from "@/features/customers/table/columns";
import { CustomersAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { CustomerFormAdvanced } from "@/components/forms/CustomerFormAdvanced";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Customer } from "@/lib/supabase-types";

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const refreshData = async () => {
    try {
      const customers = await CustomersAPI.getAll();
      setData(customers);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer.name}"?`)) {
      return;
    }
    
    try {
      await CustomersAPI.delete(customer.id);
      toast.success("✅ Đã xóa khách hàng thành công!");
      await refreshData();
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    }
  };

  const handleCreateSuccess = async () => {
    await refreshData();
  };

  const handleEditSuccess = async () => {
    setEditingCustomer(null);
    await refreshData();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải khách hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm mt-1">
            Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  try {
    // Get unique status options for filtering
    const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean)))
      .map((v) => ({ 
        label: getStatusLabel(v as string), 
        value: v as string 
      }));

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Khách hàng
              </h1>
            </div>

            {/* Customers Table */}
            <DataTable
              data={data}
              columns={createCustomerColumns(handleEditCustomer, handleDeleteCustomer)}
              toolbarConfig={{
                placeholder: "Tìm khách hàng...",
                searchColumn: "name",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CustomerFormAdvanced
                    mode="create"
                    onSuccess={handleCreateSuccess}
                  />
                ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingCustomer}
              title="Chỉnh sửa khách hàng"
              open={!!editingCustomer}
              onOpenChange={(open) => !open && setEditingCustomer(null)}
            >
              {editingCustomer && (
                <CustomerFormAdvanced
                  customer={editingCustomer}
                  mode="edit"
                  onSuccess={handleEditSuccess}
                />
              )}
            </GenericEditDialog>
          </div>
        </div>
      </div>
    );
  } catch (innerError) {
    console.error('Unexpected error:', innerError);
    throw innerError;
  }
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    active: "Hoạt động",
    inactive: "Tạm dừng", 
    pending: "Chờ duyệt"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}