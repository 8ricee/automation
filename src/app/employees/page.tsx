"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { employeeColumns } from "@/features/employees/table/columns";
import { EmployeesAPI } from "@/lib/api-fallback";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Employee } from "@/lib/supabase-types";

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const employees = await EmployeesAPI.getAll();
        setData(employees);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải nhân viên...</p>
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
            Không thể tải danh sách nhân viên. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  try {
    // Get unique department options for filtering
    const departmentOptions = Array.from(new Set(data.map((x) => x.department).filter(Boolean)))
      .map((v) => ({ 
        label: v as string, 
        value: v as string 
      }));

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
                Nhân viên
              </h1>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                👥 {data.length} nhân viên
              </div>
            </div>

            {/* Employees Table */}
            <DataTable
              data={data}
              columns={employeeColumns}
              toolbarConfig={{
                placeholder: "Tìm nhân viên...",
                searchColumn: "name",
                facetedFilters: [
                  { 
                    column: "department", 
                    title: "Phòng ban", 
                    options: departmentOptions,
                  },
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                    title="Thêm nhân viên"
                    fields={[
                      { name: "name", label: "Tên nhân viên", type: "text" },
                      { name: "email", label: "Email", type: "email" },
                      { name: "title", label: "Chức vụ", type: "text" },
                      { name: "department", label: "Phòng ban", type: "text" },
                      { name: "role", label: "Vai trò", type: "text" },
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
    terminated: "Nghỉ việc"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
} 