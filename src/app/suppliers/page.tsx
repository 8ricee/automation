"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createSupplierColumns } from "@/features/suppliers/table/columns";
import { supplierApi } from "@/features/suppliers/api/supplierApi";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { SupplierForm } from "@/features/suppliers/ui/SupplierForm";
import { toast } from "sonner";
import type { Supplier } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function SuppliersPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    supplier: Supplier | null;
    isLoading: boolean;
  }>({
    open: false,
    supplier: null,
    isLoading: false
  });

  const refreshData = async () => {
    try {
      const suppliers = await supplierApi.getAll();
      setData(suppliers);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
  };

  const handleDeleteSupplier = (supplier: Supplier) => {
    setDeleteDialog({
      open: true,
      supplier,
      isLoading: false
    });
  };

  const confirmDeleteSupplier = async () => {
    if (!deleteDialog.supplier) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await supplierApi.delete(deleteDialog.supplier.id);
      toast.success("Đã xóa nhà cung cấp thành công!");
      await refreshData();
      setDeleteDialog({
        open: false,
        supplier: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreateSuccess = async () => {
    await refreshData();
  };

  const handleUpdateSupplier = async (supplierData: any) => {
    if (!editingSupplier) return;
    
    try {
      await supplierApi.update(editingSupplier.id, supplierData);
      toast.success("Đã cập nhật nhà cung cấp thành công!");
      setEditingSupplier(null);
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
          <p className="mt-2 text-sm text-muted-foreground">Đang tải nhà cung cấp...</p>
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
            Không thể tải danh sách nhà cung cấp. Vui lòng kiểm tra kết nối và thử lại.
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
                Nhà cung cấp
              </h1>
            </div>

            {/* Suppliers Table */}
            <DataTable
              data={data || []}
              columns={createSupplierColumns(handleEditSupplier, handleDeleteSupplier)}
              toolbarConfig={{
                placeholder: "Tìm nhà cung cấp...",
                searchColumn: "name",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                      title="Thêm nhà cung cấp"
                      resource="suppliers"
                      fields={[
                        { name: "name", label: "Tên nhà cung cấp", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "company", label: "Công ty", type: "text" },
                        { name: "status", label: "Trạng thái", type: "select", options: [
                          { value: "active", label: "Hoạt động" },
                          { value: "inactive", label: "Tạm dừng" }
                        ]},
                      ]}
                    />
                ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingSupplier}
              title="Chỉnh sửa nhà cung cấp"
              open={!!editingSupplier}
              onOpenChange={(open) => !open && setEditingSupplier(null)}
            >
              {editingSupplier && (
                <SupplierForm
                  initialData={editingSupplier}
                  onSubmit={handleUpdateSupplier}
                  onCancel={() => setEditingSupplier(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteSupplier}
              title="Xóa nhà cung cấp"
              description="Hành động này không thể hoàn tác. Nhà cung cấp sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.supplier ? `"${deleteDialog.supplier.name}"` : undefined}
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
    inactive: "Tạm dừng"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
