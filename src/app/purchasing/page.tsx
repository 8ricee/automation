"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { purchaseOrderColumns } from "@/features/purchasing/table/columns";
import { PurchasingAPI } from "@/lib/purchasing-api";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { PurchaseOrder } from "@/lib/purchasing-api";

export default function PurchasingPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPurchasingOrders() {
      try {
        const purchaseOrders = await PurchasingAPI.getAll();
        setData(purchaseOrders);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPurchasingOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải đơn hàng mua...</p>
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
            Không thể tải danh sách đơn hàng mua. Vui lòng kiểm tra kết nối và thử lại.
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

    // Get pending and overdue orders
    const pendingCount = data.filter(order => order.status === 'pending').length;
    const today = new Date().toISOString().split('T')[0];
    const expiredCount = data.filter(order => 
      order.expected_delivery_date && order.expected_delivery_date < today
    ).length;

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Đơn hàng mua
              </h1>
              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium">
                    ⏳ {pendingCount} chờ duyệt
                  </div>
                )}
                {expiredCount > 0 && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-medium">
                    🚨 {expiredCount} quá hạn
                  </div>
                )}
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                  💼 {data.length} đơn hàng
                </div>
              </div>
            </div>

            {/* Purchasing Orders Table */}
            <DataTable
              data={data}
              columns={purchaseOrderColumns}
              toolbarConfig={{
                placeholder: "Tìm PO...",
                searchColumn: "po_number",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                    title="Tạo đơn hàng mua"
                    fields={[
                      { name: "po_number", label: "Số PO", type: "text" },
                      { name: "supplier_id", label: "Nhà cung cấp", type: "text" },
                      { name: "status", label: "Trạng thái", type: "text" },
                      { name: "total_amount", label: "Tổng tiền", type: "number" },
                      { name: "notes", label: "Ghi chú", type: "text" },
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
    draft: "Nháp",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    ordered: "Đã đặt hàng",
    received: "Đã nhận hàng",
    cancelled: "Hủy"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}