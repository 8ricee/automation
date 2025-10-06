"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createCustomerColumns } from "@/features/customers/table/columns";
import { useCustomers } from "@/features/customers/model/useCustomers";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { CustomerForm } from "@/features/customers/ui/CustomerForm";
import { toast } from "sonner";
import type { Customer } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { usePermissions } from "@/hooks/use-permissions";

export default function CustomersPage() {
  const { canManageCustomers } = usePermissions();
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
  const { data, loading, error, create: createCustomer, update: updateCustomer, delete: deleteCustomer } = useCustomers();

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
      await deleteCustomer(deleteDialog.customer.id);
      toast.success("Đã xóa khách hàng thành công!");
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

  const handleCreateCustomer = async (values: Record<string, unknown>) => {
    try {
      const customerData = {
        name: values.name || '',
        email: values.email || '',
        company: values.company || '',
        status: values.status || 'active',
        address: values.address || '',
        phone: values.phone || '',
        city: values.city || '',
        state: values.state || '',
        postal_code: values.postal_code || '',
        country: values.country || '',
        website: values.website || '',
        industry: values.industry || '',
        customer_type: values.customer_type || 'business',
        notes: values.notes || '',
        date_added: new Date().toISOString().split('T')[0]
      };
      await createCustomer(customerData as unknown as Parameters<typeof createCustomer>[0]);
      toast.success("Đã tạo khách hàng thành công!");
    } catch (error) {
      toast.error(`Lỗi tạo khách hàng: ${(error as Error).message}`);
    }
  };

  const handleUpdateCustomer = async (customerData: Record<string, unknown>) => {
    if (!editingCustomer) return;
    
    try {
      await updateCustomer(editingCustomer.id, customerData as unknown as Parameters<typeof updateCustomer>[1]);
      toast.success("Đã cập nhật khách hàng thành công!");
      setEditingCustomer(null);
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
