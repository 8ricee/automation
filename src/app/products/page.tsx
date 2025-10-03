"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createProductColumns } from "@/features/products/table/columns";
import { useProducts } from "@/features/products/model/useProducts";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { ProductForm } from "@/features/products/ui/ProductForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Product } from "@/lib/supabase-types";

export default function ProductsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { products: data, loading, error, refetch, create: createProduct, update: updateProduct, delete: deleteProduct } = useProducts();

  const handleCreateProduct = async (values: any) => {
    try {
      const productData = {
        name: values.name || '',
        description: values.description || '',
        sku: values.sku || '',
        price: values.price || 0,
        cost: values.cost || 0,
        stock: values.stock || 0,
        total_sales: 0,
        status: values.status || 'active',
        type: 'PHYSICAL' as const,
        supplier_id: null,
        warranty_period_months: 0
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

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }
    
    try {
      await deleteProduct(product.id);
      toast.success("✅ Đã xóa sản phẩm thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct({ id: editingProduct.id, ...productData });
      toast.success("✅ Đã cập nhật sản phẩm thành công!");
      setEditingProduct(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
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
    const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean)))
      .map((v) => ({ 
        label: getStatusLabel(v as string), 
        value: v as string 
      }));

    // Check for low stock items
    const lowStockCount = data.filter(product => 
      product.status === 'active' && product.stock && product.stock <= 10
    ).length;

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
                  <CreateRecordButton
                    title="Thêm sản phẩm"
                    fields={[
                      { name: "name", label: "Tên sản phẩm", type: "text" },
                      { name: "sku", label: "Mã SKU", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "price", label: "Giá bán (VNĐ)", type: "number" },
                      { name: "cost", label: "Giá nhập (VNĐ)", type: "number" },
                      { name: "stock", label: "Tồn kho", type: "number" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "active", label: "Hoạt động" },
                        { value: "inactive", label: "Tạm dừng" },
                        { value: "discontinued", label: "Ngừng bán" }
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
                <ProductForm
                  onSubmit={handleUpdateProduct}
                  initialData={editingProduct}
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
    discontinued: "Ngừng bán"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}