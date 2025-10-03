"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { orderColumns } from "@/features/orders/table/columns";
import { OrdersAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Order } from "@/lib/supabase-types";

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await OrdersAPI.getAll();
        setData(orders);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải đơn hàng...</p>
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
            Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean)))
    .map((v) => ({ label: getStatusLabel(v as string), value: v as string }));

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Đơn hàng</h1>
            {data.length === 0 && (
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg text-sm font-medium">
                📋 Chưa có đơn hàng nào
              </div>
            )}
          </div>

          <DataTable
            data={data}
            columns={orderColumns}
            toolbarConfig={{
              placeholder: "Tìm đơn hàng...",
              searchColumn: "order_number",
              facetedFilters: [
                { column: "status", title: "Trạng thái", options: statusOptions },
              ],
              actionsRender: (
                <CreateRecordButton
                  title="Tạo đơn hàng"
                  fields={[
                    { name: "order_number", label: "Số đơn hàng", type: "text" },
                    { name: "customer_id", label: "ID Khách hàng", type: "text" },
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
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý", 
    shipped: "Đã giao hàng",
    delivered: "Đã nhận hàng",
    cancelled: "Đã hủy",
    returned: "Trả hàng"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}