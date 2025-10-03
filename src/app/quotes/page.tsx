"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { quoteColumns } from "@/features/quotes/table/columns";
import { QuotesAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Quote } from "@/lib/supabase-types";

export default function QuotesPage() {
  const [data, setData] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const quotes = await QuotesAPI.getAll();
        setData(quotes);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuotes();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải báo giá...</p>
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
            Không thể tải danh sách báo giá. Vui lòng kiểm tra kết nối và thử lại.
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
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Báo giá</h1>
            {data.length === 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                💼 Chưa có báo giá nào
              </div>
            )}
          </div>

          <DataTable
            data={data}
            columns={quoteColumns}
            toolbarConfig={{
              placeholder: "Tìm báo giá...",
              searchColumn: "quote_number",
              facetedFilters: [
                { column: "status", title: "Trạng thái", options: statusOptions },
              ],
              actionsRender: (
                <CreateRecordButton
                  title="Tạo báo giá"
                  fields={[
                    { name: "quote_number", label: "Số báo giá", type: "text" },
                    { name: "customer_id", label: "ID Khách hàng", type: "text" },
                    { name: "status", label: "Trạng thái", type: "text" },
                    { name: "valid_for_days", label: "Thời hạn (ngày)", type: "number" },
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
    draft: "Nháp",
    sent: "Đã gửi",
    accepted: "Đã chấp nhận", 
    rejected: "Từ chối",
    expired: "Hết hạn"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}