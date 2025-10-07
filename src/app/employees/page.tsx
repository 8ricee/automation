"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createEmployeeColumns } from "@/features/employees/table/columns";
import { useEmployees } from "@/features/employees/model/useEmployees";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { EmployeeForm } from "@/features/employees/ui/EmployeeForm";
import { toast } from "sonner";
import type { Employee } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Loading } from "@/components/ui/loading";
import { usePermissions } from "@/hooks/use-permissions";

export default function EmployeesPage() {
  const { canManageEmployees } = usePermissions();
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
  const { data, loading, error, create: createEmployee, update: updateEmployee, delete: deleteEmployee } = useEmployees();

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
      await deleteEmployee(deleteDialog.employee.id);
      toast.success("Đã xóa nhân viên thành công!");
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


  const handleCreateEmployee = async (values: Record<string, unknown>) => {
    try {
      const employeeData = {
        name: values.name || '',
        email: values.email || '',
        position: values.position || '',
        department: values.department || '',
        status: values.status || 'active',
        role_id: values.role_id || '',
        phone: values.phone || '',
        hire_date: values.hire_date || new Date().toISOString().split('T')[0],
        salary: values.salary || 0,
        employee_id: values.employee_id || '',
        manager_id: values.manager_id || '',
        address: values.address || '',
        city: values.city || '',
        state: values.state || '',
        postal_code: values.postal_code || '',
        country: values.country || '',
        notes: values.notes || '',
        is_active: values.is_active || true,
        last_login: null,
        password_hash: ''
      };
      await createEmployee(employeeData as unknown as Parameters<typeof createEmployee>[0]);
      toast.success("Đã tạo nhân viên thành công!");
    } catch (error) {
      toast.error(`Lỗi tạo nhân viên: ${(error as Error).message}`);
    }
  };

  const handleUpdateEmployee = async (employeeData: Record<string, unknown>) => {
    if (!editingEmployee) return;
    
    try {
      await updateEmployee(editingEmployee.id, employeeData as unknown as Parameters<typeof updateEmployee>[1]);
      toast.success("Đã cập nhật nhân viên thành công!");
      setEditingEmployee(null);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu nhân viên..." />;
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
                  canManageEmployees() ? (
                    <CreateRecordButton
                      title="Thêm nhân viên"
                      resource="employees"
                      fields={[
                        { name: "name", label: "Tên nhân viên", type: "text" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "position", label: "Chức vụ", type: "text" },
                        { name: "department", label: "Phòng ban", type: "text" },
                        { name: "role_id", label: "Vai trò", type: "select", options: [
                          { value: "admin", label: "Quản trị viên" },
                          { value: "director", label: "Ban giám đốc" },
                          { value: "manager", label: "Trưởng phòng" },
                          { value: "sales", label: "Sales" },
                          { value: "engineer", label: "Kỹ sư" },
                          { value: "accountant", label: "Kế toán" },
                          { value: "warehouse", label: "Thủ kho" },
                          
                        ]},
                      ]}
                      onCreate={handleCreateEmployee}
                    />
                  ) : null
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
