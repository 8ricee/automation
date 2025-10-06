"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createProductColumns } from "@/features/products/table/columns";
import { useProducts } from "@/features/products/model/useProducts";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { ProductForm } from "@/features/products/ui/ProductForm";
import { toast } from "sonner";
import type { Product } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function ProductsPage() {
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
  const { products: data, loading, error, create: createProduct, update: updateProduct, delete: deleteProduct } = useProducts();

  const handleCreateProduct = async (values: Record<string, unknown>) => {
    try {
      const productData = {
        name: values.name || '',
        sku: values.sku || '',
        description: values.description || '',
        price: values.price || 0,
        cost: values.cost || 0,
        stock_quantity: values.stock_quantity || 0,
        min_stock_level: values.min_stock_level || 0,
        max_stock_level: values.max_stock_level || 1000,
        supplier_id: values.supplier_id || null,
        category: values.category || '',
        brand: values.brand || '',
        status: values.status || 'active',
        weight: values.weight || null,
        dimensions: values.dimensions || null,
        unit: values.unit || 'piece',
        warranty_period_months: values.warranty_period_months || null,
        notes: values.notes || ''
      };
      await createProduct(productData as unknown as Parameters<typeof createProduct>[0]);
      toast.success("Đã tạo sản phẩm thành công!");
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
      await updateProduct(editingProduct.id, productData);
      toast.success("Đã cập nhật sản phẩm thành công!");
      setEditingProduct(null);
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

  try {
    // Get unique status options for filtering
    const statusOptions = Array.from(new Set((data || []).map((x: Product) => x.status).filter(Boolean)))
      .map((v) => ({ 
        label: getStatusLabel(v as string), 
        value: v as string 
      }));

    // Get product statistics
    // const activeCount = (data || []).filter((p: Product) => p.status === 'active').length;
    // const inactiveCount = (data || []).filter((p: Product) => p.status === 'inactive').length;
    // const discontinuedCount = (data || []).filter((p: Product) => p.status === 'discontinued').length;
    // const totalValue = (data || []).reduce((sum: number, p: Product) => sum + ((p.price || 0) * (p.stock_quantity || 0)), 0);

    return (
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
              data={data || []}
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
                  <CreateRecordButton
                    title="Thêm sản phẩm"
                    resource="products"
                    fields={[
                      { name: "name", label: "Tên sản phẩm", type: "text" },
                      { name: "sku", label: "SKU", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "price", label: "Giá", type: "number" },
                      { name: "cost", label: "Chi phí", type: "number" },
                      { name: "stock_quantity", label: "Số lượng tồn kho", type: "number" },
                      { name: "min_stock_level", label: "Mức tồn kho tối thiểu", type: "number" },
                      { name: "max_stock_level", label: "Mức tồn kho tối đa", type: "number" },
                      { name: "supplier_id", label: "ID Nhà cung cấp", type: "text" },
                      { name: "category", label: "Danh mục", type: "text" },
                      { name: "brand", label: "Thương hiệu", type: "text" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "active", label: "Hoạt động" },
                        { value: "inactive", label: "Không hoạt động" },
                        { value: "discontinued", label: "Ngừng sản xuất" }
                      ]},
                      { name: "weight", label: "Trọng lượng", type: "number" },
                      { name: "dimensions", label: "Kích thước", type: "text" },
                      { name: "unit", label: "Đơn vị", type: "text" },
                      { name: "warranty_period_months", label: "Bảo hành (tháng)", type: "number" },
                      { name: "notes", label: "Ghi chú", type: "text" },
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
                <ProductForm
                  initialData={editingProduct}
                  onSubmit={handleUpdateProduct}
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
    throw innerError;
  }
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    active: "Hoạt động",
    inactive: "Không hoạt động", 
    discontinued: "Ngừng sản xuất"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
