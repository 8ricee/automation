"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createInventoryColumns } from "@/features/inventory/table/columns";
import { useEntity } from "@/hooks/use-entity";
import { inventoryApi } from "@/features/inventory/api/inventoryApi";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { InventoryForm } from "@/features/inventory/ui/InventoryForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Product } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function InventoryPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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
  const { data, loading, error, refetch, create: createProduct, update: updateProduct, delete: deleteProduct } = useEntity(inventoryApi);

  const handleCreateProduct = async (values: any) => {
    try {
      const productData = {
        name: values.name || '',
        sku: values.sku || '',
        stock_quantity: values.stock_quantity || 0,
        price: values.price || 0,
        cost: values.cost || 0,
        status: values.status || 'active',
        description: values.description || '',
        category: values.category || '',
        supplier_id: values.supplier_id || null,
        min_stock_level: values.min_stock_level || 10,
        max_stock_level: values.max_stock_level || 1000,
        notes: values.notes || ''
      };
      await createProduct(productData);
      toast.success("Đã tạo sản phẩm thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi tạo sản phẩm: ${(error as Error).message}`);
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
      await deleteProduct(deleteDialog.product.id);
      toast.success("Đã xóa sản phẩm thành công!");
      setRefreshTrigger(prev => prev + 1);
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

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct(editingProduct.id, productData);
      toast.success("Đã cập nhật sản phẩm thành công!");
      setEditingProduct(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải kho hàng...</p>
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

    // Get low stock items
    const lowStockCount = data.filter(item => item.stock_quantity && item.stock_quantity <= 10).length;

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
              data={data}
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
                  <CreateRecordButton
                    title="Thêm sản phẩm"
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
                  inventoryItem={editingProduct as any}
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