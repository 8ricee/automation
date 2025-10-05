"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/table/data-table";
import { DataTableToolbar } from "@/components/table/data-table-toolbar";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useSuppliers } from "@/features/suppliers";
import { columns } from "@/features/suppliers/table/columns";
import { SupplierForm } from "@/features/suppliers/ui/SupplierForm";
import { toast } from "sonner";

export default function SuppliersPage() {
  const { data: suppliers, loading, error, create, update, delete: remove } = useSuppliers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async (data: any) => {
    try {
      setIsLoading(true);
      await create(data);
      setIsCreateDialogOpen(false);
      toast.success("Tạo nhà cung cấp thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo nhà cung cấp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: any) => {
    try {
      setIsLoading(true);
      await update(selectedSupplier.id, data);
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      toast.success("Cập nhật nhà cung cấp thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật nhà cung cấp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await remove(selectedSupplier.id);
      setIsDeleteDialogOpen(false);
      setSelectedSupplier(null);
      toast.success("Xóa nhà cung cấp thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa nhà cung cấp");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Đang tải...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-64 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nhà cung cấp</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin các nhà cung cấp
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Thêm nhà cung cấp
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={suppliers || []}
      />

      {/* Create Dialog */}
      <GenericEditDialog
        data={null}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        title="Tạo nhà cung cấp mới"
      >
        <SupplierForm
          onSubmit={handleCreate}
          isLoading={isLoading}
          onCancel={() => setIsCreateDialogOpen(false)}
        />
      </GenericEditDialog>

      {/* Edit Dialog */}
      <GenericEditDialog
        data={selectedSupplier}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        title="Chỉnh sửa nhà cung cấp"
      >
        {selectedSupplier && (
          <SupplierForm
            onSubmit={handleEdit}
            initialData={selectedSupplier}
            isLoading={isLoading}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedSupplier(null);
            }}
          />
        )}
      </GenericEditDialog>

      {/* Delete Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isLoading={isLoading}
        title="Xóa nhà cung cấp"
        description={`Bạn có chắc chắn muốn xóa nhà cung cấp "${selectedSupplier?.name}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
}
