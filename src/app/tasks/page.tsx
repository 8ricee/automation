"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { taskColumns } from "@/features/tasks/table/columns";
import { TasksAPI } from "@/lib/tasks-api";
import { CreateRecordButton } from "@/components/table/create-record-button";
import type { Task } from "@/lib/tasks-api";

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const tasks = await TasksAPI.getAll();
        setData(tasks);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải công việc...</p>
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
            Không thể tải danh sách công việc. Vui lòng kiểm tra kết nối và thử lại.
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

    // Get unique priority options for filtering
    const priorityOptions = Array.from(new Set(data.map((x) => x.priority).filter(Boolean)))
      .map((v) => ({ 
        label: getPriorityLabel(v as string), 
        value: v as string 
      }));

    // Get overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = data.filter(task => 
      task.due_date && task.due_date < today && 
      task.status !== 'done' && task.status !== 'cancelled'
    ).length;

    // Get in progress tasks
    const inProgressCount = data.filter(task => task.status === 'in_progress').length;

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Công việc
              </h1>
              <div className="flex gap-2">
                {overdueCount > 0 && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-lg text-sm font-medium">
                    🚨 {overdueCount} quá hạn
                  </div>
                )}
                {inProgressCount > 0 && (
                  <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-sm font-medium">
                    🔄 {inProgressCount} đang thực hiện
                  </div>
                )}
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-sm font-medium">
                  📋 {data.length} công việc
                </div>
              </div>
            </div>

            {/* Tasks Table */}
            <DataTable
              data={data}
              columns={taskColumns}
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
                    title: "ưu tiên", 
                    options: priorityOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                    title="Thêm công việc"
                    fields={[
                      { name: "title", label: "Tiêu đề", type: "text" },
                      { name: "description", label: "Mô tả", type: "text" },
                      { name: "status", label: "Trạng thái", type: "text" },
                      { name: "priority", label: "ưu tiên", type: "text" },
                      { name: "due_date", label: "Hạn cuối", type: "date" },
                      { name: "estimated_hours", label: "Giờ ước tính", type: "number" },
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
    todos: "Cần làm",
    in_progress: "Đang thực hiện",
    review: "Chờ duyệt",
    done: "Hoàn thành",
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