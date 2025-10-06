"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createCustomerColumns } from "@/features/customers/table/columns";
import { customerApi } from "@/features/customers/api/customerApi";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { CustomerForm } from "@/features/customers/ui/CustomerForm";
import { toast } from "sonner";
import type { Customer } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { usePermissions } from "@/hooks/use-permissions";

export default function CustomersPage() {
  const { canManageCustomers } = usePermissions();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    customer: Customer | null;
    isLoading: boolean;
  }>({
    open: false,
    customer: null,
    isLoading: false
  });

  const refreshData = async () => {
    try {
      const customers = await customerApi.getAll();
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

  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteDialog({
      open: true,
      customer,
      isLoading: false
    });
  };

  const confirmDeleteCustomer = async () => {
    if (!deleteDialog.customer) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await customerApi.delete(deleteDialog.customer.id);
      toast.success("Đã xóa khách hàng thành công!");
      await refreshData();
      setDeleteDialog({
        open: false,
        customer: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  // // const handleCreateSuccess = async () => {
  //   await refreshData();
  // };

  const handleUpdateCustomer = async (customerData: Record<string, unknown>) => {
    if (!editingCustomer) return;
    
    try {
      await customerApi.update(editingCustomer.id, customerData);
      toast.success("Đã cập nhật khách hàng thành công!");
      setEditingCustomer(null);
      await refreshData();
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
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

  // Get unique status options for filtering
  const statusOptions = Array.from(new Set((data || []).map((x) => x.status).filter(Boolean)))
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
              data={data || []}
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
                  canManageCustomers() ? (
                    <CreateRecordButton
                        title="Thêm khách hàng"
                        resource="customers"
                        fields={[
                          { name: "name", label: "Tên khách hàng", type: "text" },
                          { name: "email", label: "Email", type: "email" },
                          { name: "company", label: "Công ty", type: "text" },
                          { name: "status", label: "Trạng thái", type: "select", options: [
                            { value: "active", label: "Hoạt động" },
                            { value: "inactive", label: "Không hoạt động" },
                            { value: "pending", label: "Chờ duyệt" }
                          ]},
                        ]}
                      />
                  ) : null
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
                <CustomerForm
                  customer={editingCustomer}
                  onSubmit={handleUpdateCustomer}
                  onCancel={() => setEditingCustomer(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteCustomer}
              title="Xóa khách hàng"
              description="Hành động này không thể hoàn tác. Khách hàng sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.customer ? `"${deleteDialog.customer.name}"` : undefined}
              isLoading={deleteDialog.isLoading}
            />
          </div>
        </div>
      </div>
  );
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    active: "Hoạt động",
    inactive: "Không hoạt động", 
    pending: "Chờ duyệt"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
