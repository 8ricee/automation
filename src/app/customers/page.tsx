"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { customerColumns } from "@/features/customers/table/columns";
import { CustomersAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Customer } from "@/lib/supabase-types";

export default function CustomersPage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const customers = await CustomersAPI.getAll();
        setData(customers);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải khách hàng...</p>
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
            Không thể tải danh sách khách hàng. Vui lòng kiểm tra kết nối và thử lại.
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
                Khách hàng
              </h1>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-medium">
                📊 {data.length} khách hàng
              </div>
            </div>

            {/* Customers Table */}
            <DataTable
              data={data}
              columns={customerColumns}
              toolbarConfig={{
                placeholder: "Tìm khách hàng...",
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
                    title="Thêm khách hàng"
                    fields={[
                      { name: "name", label: "Tên khách hàng", type: "text" },
                      { name: "email", label: "Email", type: "email" },
                      { name: "company", label: "Công ty", type: "text" },
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
    pending: "Chờ duyệt"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}