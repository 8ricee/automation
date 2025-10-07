"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createTaskColumns, TaskForm, useTasks } from "@/features/tasks";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { toast } from "sonner";
import type { Task } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { Loading } from "@/components/ui/loading";
import { usePermissions } from "@/hooks/use-permissions";

export default function TasksPage() {
  const { canManageTasks } = usePermissions();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    task: Task | null;
    isLoading: boolean;
  }>({
    open: false,
    task: null,
    isLoading: false
  });
  const { tasks: data, loading, error, create: createTask, update: updateTask, delete: deleteTask } = useTasks();

  const handleCreateTask = async (values: Record<string, unknown>) => {
    try {
      const taskData = {
        title: values.title || '',
        description: values.description || '',
        status: values.status || 'todo',
        priority: values.priority || 'medium',
        due_date: values.due_date || null,
        estimated_hours: values.estimated_hours || 0,
        project_id: null,
        assignee_id: null,
        billable: false,
        completed_hours: 0
      };
      await createTask(taskData as unknown as Parameters<typeof createTask>[0]);
      toast.success("Đã tạo công việc thành công!");
    } catch (error) {
      toast.error(`Lỗi tạo công việc: ${(error as Error).message}`);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleDeleteTask = (task: Task) => {
    setDeleteDialog({
      open: true,
      task,
      isLoading: false
    });
  };

  const confirmDeleteTask = async () => {
    if (!deleteDialog.task) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteTask(deleteDialog.task.id);
      toast.success("Đã xóa công việc thành công!");
      setDeleteDialog({
        open: false,
        task: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateTask = async (taskData: Record<string, unknown>) => {
    if (!editingTask) return;
    
    try {
      await updateTask(editingTask.id, taskData);
      toast.success("Đã cập nhật công việc thành công!");
      setEditingTask(null);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu công việc..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm mt-1">
            Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  try {
    // Get unique status options for filtering
    const statusOptions = Array.from(new Set((data || []).map((x) => x.status).filter(Boolean)))
      .map((v) => ({ 
        label: getStatusLabel(v as string), 
        value: v as string 
      }));

    // Get unique priority options for filtering
    const priorityOptions = Array.from(new Set((data || []).map((x) => x.priority).filter(Boolean)))
      .map((v) => ({ 
        label: getPriorityLabel(v as string), 
        value: v as string 
      }));

    // Get overdue tasks
      // const today = new Date().toISOString().split('T')[0];
    // const overdueCount = (data || []).filter(task => 
    //   task.due_date && task.due_date < today && 
    //   task.status !== 'done' && task.status !== 'cancelled'
    // ).length;

    // Get in progress tasks
    // const inProgressCount = (data || []).filter(task => task.status === 'in_progress').length;

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Công việc
              </h1>
            </div>

            {/* Tasks Table */}
            <DataTable
              data={(data || []) as unknown as Task[]}
              columns={createTaskColumns(handleEditTask, handleDeleteTask)}
              toolbarConfig={{
                placeholder: "Tìm công việc...",
                searchColumn: "title",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                  { 
                    column: "priority", 
                    title: "Ưu tiên", 
                    options: priorityOptions,
                  },
                ],
                actionsRender: (
                  canManageTasks() ? (
                    <CreateRecordButton
                    title="Thêm công việc"
                    resource="tasks"
                    fields={[
                      { name: "title", label: "Tiêu đề", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "status", label: "Trạng thái", type: "select", options: [
                        { value: "todo", label: "Cần làm" },
                        { value: "in_progress", label: "Đang thực hiện" },
                        { value: "completed", label: "Hoàn thành" },
                        { value: "cancelled", label: "Đã hủy" }
                      ]},
                      { name: "priority", label: "Ưu tiên", type: "select", options: [
                        { value: "low", label: "Thấp" },
                        { value: "medium", label: "Trung bình" },
                        { value: "high", label: "Cao" },
                        { value: "urgent", label: "Khẩn cấp" }
                      ]},
                      { name: "due_date", label: "Hạn cuối", type: "date" },
                      { name: "estimated_hours", label: "Giờ ước tính", type: "number" },
                    ]}
                    onCreate={handleCreateTask}
                  />
                ) : null
              ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingTask}
              title="Chỉnh sửa công việc"
              open={!!editingTask}
              onOpenChange={(open) => !open && setEditingTask(null)}
            >
              {editingTask && (
                <TaskForm
                  task={editingTask}
                  onSubmit={handleUpdateTask}
                  onCancel={() => setEditingTask(null)}
                />
              )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteTask}
              title="Xóa công việc"
              description="Hành động này không thể hoàn tác. Công việc sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.task ? `"${deleteDialog.task.title}"` : undefined}
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
    todo: "Cần làm",
    in_progress: "Đang thực hiện",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}

function getPriorityLabel(priority: string): string {
  const priorityLabels = {
    low: "Thấp",
    medium: "Trung bình",
    high: "Cao",
    urgent: "Khẩn cấp"
  };
  
  return priorityLabels[priority as keyof typeof priorityLabels] || priority;
}

