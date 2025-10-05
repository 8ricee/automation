"use client";

import { useEffect, useState } from "react";
import { PageGuard } from "@/components/auth/PageGuard";
import { DataTable } from "@/components/table/data-table";
import { createProductColumns } from "@/features/products/table/columns";
import { productApi } from "@/features/products/api/productApi";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { ProductForm } from "@/features/products/ui/ProductForm";
import { toast } from "sonner";
import type { Product } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const refreshData = async () => {
    try {
      const products = await productApi.getAll();
      setData(products);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

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
      await productApi.delete(deleteDialog.product.id);
      toast.success("Đã xóa sản phẩm thành công!");
      await refreshData();
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

  const handleCreateSuccess = async () => {
    await refreshData();
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await productApi.update(editingProduct.id, productData);
      toast.success("Đã cập nhật sản phẩm thành công!");
      setEditingProduct(null);
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
          <p className="mt-2 text-sm text-muted-foreground">Đang tải sản phẩm...</p>
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
            Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Get unique status options for filtering
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean)))
    .map((v) => ({ 
      label: getStatusLabel(v as string), 
      value: v as string 
    }));

  return (
    <PageGuard 
      requiredPermissions={['products:view']}
      pageName="Quản lý Sản phẩm"
    >
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Sản phẩm
              </h1>
            </div>

            {/* Products Table */}
            <DataTable
              data={data}
              columns={createProductColumns(handleEditProduct, handleDeleteProduct)}
              toolbarConfig={{
                placeholder: "Tìm sản phẩm...",
                searchColumn: "name",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <PageGuard 
                    requiredPermissions={['products:create']}
                    pageName="Tạo sản phẩm"
                  >
                    <CreateRecordButton
                      title="Thêm sản phẩm"
                      fields={[
                        { name: "name", label: "Tên sản phẩm", type: "text" },
                        { name: "sku", label: "SKU", type: "text" },
                        { name: "price", label: "Giá", type: "number" },
                        { name: "status", label: "Trạng thái", type: "select", options: [
                          { value: "active", label: "Hoạt động" },
                          { value: "inactive", label: "Không hoạt động" },
                          { value: "discontinued", label: "Ngừng sản xuất" }
                        ]},
                      ]}
                    />
                  </PageGuard>
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
                <ProductForm
                  initialData={editingProduct}
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
    </PageGuard>
  );
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    active: "Hoạt động",
    inactive: "Không hoạt động", 
    discontinued: "Ngừng sản xuất"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
