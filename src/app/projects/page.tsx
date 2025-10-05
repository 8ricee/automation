"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createProjectColumns } from "@/features/projects/table/columns";
import { useProjects } from "@/features/projects/model/useProjects";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { ProjectForm } from "@/features/projects/ui/ProjectForm";
import { projectApi } from "@/features/projects/api/projectApi";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Project } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function ProjectsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    project: Project | null;
    isLoading: boolean;
  }>({
    open: false,
    project: null,
    isLoading: false
  });
  const { projects: data, loading, error, refetch, create: createProject, update: updateProject, delete: deleteProject } = useProjects();

  const handleCreateProject = async (values: any) => {
    try {
      const projectData = {
        name: values.name || '',
        description: values.description || '',
        customer_id: values.customer_id || null,
        status: values.status || 'planning',
        progress_percentage: values.progress_percentage || 0,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        budget: values.budget || null,
        project_manager_id: values.project_manager_id || null,
        priority: 'medium' as const,
        actual_cost: 0,
        notes: ''
      };
      await createProject(projectData);
      toast.success("Đã tạo dự án thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi tạo dự án: ${(error as Error).message}`);
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (project: Project) => {
    setDeleteDialog({
      open: true,
      project,
      isLoading: false
    });
  };

  const confirmDeleteProject = async () => {
    if (!deleteDialog.project) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteProject(deleteDialog.project.id);
      toast.success("Đã xóa dự án thành công!");
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialog({
        open: false,
        project: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    if (!editingProject) return;
    
    try {
      await updateProject(editingProject.id, projectData);
      toast.success("Đã cập nhật dự án thành công!");
      setEditingProject(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
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
              columns={createProjectColumns(handleEditProject, handleDeleteProject)}
              toolbarConfig={{
                placeholder: "Tìm dự án...",
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
                    title="Thêm dự án"
                    fields={[
                      { name: "name", label: "Tên dự án", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "customer_id", label: "ID Khách hàng", type: "text" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "planning", label: "Đang lập kế hoạch" },
                        { value: "in_progress", label: "Đang thực hiện" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Hủy bỏ" }
                      ]},
                      { name: "progress_percentage", label: "Tiến độ (%)", type: "number", min: 0, max: 100 },
                      { name: "start_date", label: "Ngày bắt đầu", type: "date" },
                      { name: "end_date", label: "Ngày kết thúc", type: "date" },
                      { name: "budget", label: "Ngân sách (VND)", type: "number" },
                      { name: "project_manager_id", label: "ID Quản lý dự án", type: "text" },
                    ]}
                    onCreate={handleCreateProject}
                  />
                ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingProject}
              title="Chỉnh sửa dự án"
              open={!!editingProject}
              onOpenChange={(open) => !open && setEditingProject(null)}
            >
              {editingProject && (
                <ProjectForm
                  initialData={editingProject}
                  onSubmit={handleUpdateProject}
                  onCancel={() => setEditingProject(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteProject}
              title="Xóa dự án"
              description="Hành động này không thể hoàn tác. Dự án sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.project ? `"${deleteDialog.project.name}"` : undefined}
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
    planning: "Lập kế hoạch",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}