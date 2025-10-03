"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { inventoryColumns } from "@/features/inventory/table/columns";
import { InventoryAPI } from "@/lib/inventory-api";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Product } from "@/lib/supabase-types";

export default function InventoryPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const inventory = await InventoryAPI.getAll();
        setData(inventory);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchInventory();
  }, []);

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
    const lowStockCount = data.filter(item => item.stock && item.stock <= 10).length;

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
              columns={inventoryColumns}
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
                      { name: "stock", label: "Số lượng tồn kho", type: "number" },
                      { name: "price", label: "Giá bán", type: "number" },
                      { name: "cost", label: "Giá nhập", type: "number" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "active", label: "Hoạt động" },
                        { value: "inactive", label: "Tạm dừng" },
                        { value: "discontinued", label: "Ngừng sản xuất" }
                      ]},
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
    discontinued: "Ngừng sản xuất"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}