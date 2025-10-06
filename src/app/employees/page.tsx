"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createEmployeeColumns } from "@/features/employees/table/columns";
import { employeeApi } from "@/features/employees/api/employeeApi";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { EmployeeForm } from "@/features/employees/ui/EmployeeForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Employee } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function EmployeesPage() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employee: Employee | null;
    isLoading: boolean;
  }>({
    open: false,
    employee: null,
    isLoading: false
  });

  const refreshData = async () => {
    try {
      const employees = await employeeApi.getAll();
      setData(employees);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteDialog({
      open: true,
      employee,
      isLoading: false
    });
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteDialog.employee) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await employeeApi.delete(deleteDialog.employee.id);
      toast.success("Đã xóa nhân viên thành công!");
      await refreshData();
      setDeleteDialog({
        open: false,
        employee: null,
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

  const handleUpdateEmployee = async (employeeData: any) => {
    if (!editingEmployee) return;
    
    try {
      await employeeApi.update(editingEmployee.id, employeeData);
      toast.success("Đã cập nhật nhân viên thành công!");
      setEditingEmployee(null);
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
            </div>

            {/* Employees Table */}
            <DataTable
              data={data || []}
              columns={createEmployeeColumns(handleEditEmployee, handleDeleteEmployee)}
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
                    resource="employees"
                    fields={[
                      { name: "name", label: "Tên nhân viên", type: "text" },
                      { name: "email", label: "Email", type: "email" },
                      { name: "title", label: "Chức vụ", type: "text" },
                      { name: "department", label: "Phòng ban", type: "text" },
                      { name: "role", label: "Vai trò", type: "select", options: [
                        { value: "admin", label: "Quản trị viên" },
                        { value: "director", label: "Ban giám đốc" },
                        { value: "manager", label: "Trưởng phòng" },
                        { value: "sales", label: "Sales" },
                        { value: "engineer", label: "Kỹ sư" },
                        { value: "accountant", label: "Kế toán" },
                        { value: "warehouse", label: "Thủ kho" },
                        
                      ]},
                    ]}
                  />
                ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingEmployee}
              title="Chỉnh sửa nhân viên"
              open={!!editingEmployee}
              onOpenChange={(open) => !open && setEditingEmployee(null)}
            >
              {editingEmployee && (
                <EmployeeForm
                  employee={editingEmployee}
                  onSubmit={handleUpdateEmployee}
                  onCancel={() => setEditingEmployee(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteEmployee}
              title="Xóa nhân viên"
              description="Hành động này không thể hoàn tác. Nhân viên sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.employee ? `"${deleteDialog.employee.name}"` : undefined}
              isLoading={deleteDialog.isLoading}
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
