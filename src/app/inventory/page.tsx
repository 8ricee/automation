"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createInventoryColumns } from "@/features/inventory/table/columns";
import { useInventory } from "@/features/inventory/model/useInventory";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { InventoryForm } from "@/features/inventory/ui/InventoryForm";
import { toast } from "sonner";
import type { Product } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Loading } from "@/components/ui/loading";
import { usePermissions } from "@/hooks/use-permissions";

export default function InventoryPage() {
  const { canManageProducts } = usePermissions();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    product: Product | null;
    isLoading: boolean;
  }>({
    open: false,
    product: null,
    isLoading: false
  });
  const { inventory: data, loading, error, updateStock } = useInventory();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateProduct = async (_values: Record<string, unknown>) => {
    try {
      // Inventory page chỉ quản lý stock, không tạo sản phẩm mới
      toast.info("Vui lòng tạo sản phẩm từ trang Products trước khi quản lý tồn kho");
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteDialog({
      open: true,
      product,
      isLoading: false
    });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteDialog.product) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Inventory page không xóa sản phẩm, chỉ quản lý stock
      toast.info("Vui lòng xóa sản phẩm từ trang Products");
      setDeleteDialog({
        open: false,
        product: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateProduct = async (productData: Record<string, unknown>) => {
    if (!editingProduct) return;
    
    try {
      // Chỉ cập nhật stock quantity
      if (productData.stock_quantity !== undefined) {
        await updateStock(editingProduct.id, Number(productData.stock_quantity));
        toast.success("Đã cập nhật tồn kho thành công!");
        setEditingProduct(null);
      } else {
        toast.info("Chỉ có thể cập nhật số lượng tồn kho từ trang này");
      }
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu tồn kho..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm mt-1">
            Không thể tải dữ liệu kho hàng. Vui lòng kiểm tra kết nối và thử lại.
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
                Kho hàng
              </h1>
            </div>

            {/* Inventory Table */}
            <DataTable
              data={data || []}
              columns={createInventoryColumns(handleEditProduct, handleDeleteProduct)}
              toolbarConfig={{
                placeholder: "Tìm trong kho...",
                searchColumn: "name",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  canManageProducts() ? (
                    <CreateRecordButton
                    title="Thêm sản phẩm"
                    resource="products"
                    fields={[
                      { name: "name", label: "Tên sản phẩm", type: "text" },
                      { name: "sku", label: "SKU", type: "text" },
                      { name: "stock_quantity", label: "Số lượng tồn kho", type: "number" },
                      { name: "price", label: "Giá bán", type: "number" },
                      { name: "cost", label: "Giá nhập", type: "number" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "active", label: "Hoạt động" },
                        { value: "inactive", label: "Tạm dừng" },
                        { value: "discontinued", label: "Ngừng sản xuất" }
                      ]},
                    ]}
                    onCreate={handleCreateProduct}
                  />
                ) : null
              ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingProduct}
              title="Chỉnh sửa sản phẩm"
              open={!!editingProduct}
              onOpenChange={(open) => !open && setEditingProduct(null)}
            >
              {editingProduct && (
                <InventoryForm
                  inventoryItem={editingProduct}
                  onSubmit={handleUpdateProduct}
                  onCancel={() => setEditingProduct(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteProduct}
              title="Xóa sản phẩm"
              description="Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.product ? `"${deleteDialog.product.name}"` : undefined}
              isLoading={deleteDialog.isLoading}
            />
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
    discontinued: "Ngừng sản xuất"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}

