"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { productColumns } from "@/features/products/table/columns";
import { ProductsAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Product } from "@/lib/supabase-types";

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const products = await ProductsAPI.getAll();
        setData(products);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

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
              {lowStockCount > 0 && (
                <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-medium">
                  ⚠️ {lowStockCount} sản phẩm tồn kho thấp
                </div>
              )}
            </div>

            {/* Products Table */}
            <DataTable
              data={data}
              columns={productColumns}
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
                      { name: "status", label: "Trạng thái", type: "text" },
                    ]}
                  />
                ),
              }}
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
    discontinued: "Ngừng bán"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}