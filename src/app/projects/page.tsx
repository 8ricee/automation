"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { projectColumns } from "@/features/projects/table/columns";
import { useProjects } from "@/features/projects/model/useProjects";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { ProjectsAPI } from "@/lib/api-fallback";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { projects: data, loading, error, refetch, create: createProject } = useProjects();

  const handleCreateProject = async (values: any) => {
    try {
      const projectData = {
        title: values.title || '',
        description: values.description || '',
        customer_id: values.customer_id || null,
        status: values.status || 'planning',
        progress: values.progress || 0,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        budget: values.budget || null,
        project_manager_id: values.project_manager_id || null,
        billable_rate: values.billable_rate || null
      };
      await createProject(projectData);
      toast.success("Đã tạo dự án thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi tạo dự án: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải dự án...</p>
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
            Không thể tải danh sách dự án. Vui lòng kiểm tra kết nối và thử lại.
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

    // Get project statistics
    const completedCount = data.filter(p => p.status === 'completed').length;
    const inProgressCount = data.filter(p => p.status === 'in_progress').length;
    const planningCount = data.filter(p => p.status === 'planning').length;
    const totalBudget = data.reduce((sum, p) => sum + (p.budget || 0), 0);

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Dự án
              </h1>
            </div>

            {/* Projects Table */}
            <DataTable
              data={data}
              columns={projectColumns}
              toolbarConfig={{
                placeholder: "Tìm dự án...",
                searchColumn: "title",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                    title="Thêm dự án"
                    fields={[
                      { name: "title", label: "Tiêu đề dự án", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "customer_id", label: "ID Khách hàng", type: "text" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "planning", label: "Đang lập kế hoạch" },
                        { value: "in_progress", label: "Đang thực hiện" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Hủy bỏ" }
                      ]},
                      { name: "progress", label: "Tiến độ (%)", type: "number", min: 0, max: 100 },
                      { name: "start_date", label: "Ngày bắt đầu", type: "date" },
                      { name: "end_date", label: "Ngày kết thúc", type: "date" },
                      { name: "budget", label: "Ngân sách (VND)", type: "number" },
                      { name: "project_manager_id", label: "ID Quản lý dự án", type: "text" },
                      { name: "billable_rate", label: "Tỷ lệ thanh toán (VND/giờ)", type: "number" },
                    ]}
                    onCreate={handleCreateProject}
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
    planning: "Lập kế hoạch",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}