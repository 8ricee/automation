"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createStatusColumn, createDateColumn, createTextColumn } from "@/components/table/column-utils";
import type { Task } from "@/lib/supabase-types";

// Extended Task type with joined data
type TaskWithJoins = Task & {
  projects?: { name: string };
  assignee?: { name: string; email: string };
};

export const createTaskColumns = (
  onEdit?: (task: Task) => void,
  onDelete?: (task: Task) => void
): ColumnDef<Task>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  createIdColumn(),
  createTextColumn("title", "Tiêu đề", 25),
  createStatusColumn("status", "Trạng thái"),
  createStatusColumn("priority", "Ưu tiên"),
  createDateColumn("due_date", "Hạn"),
  { 
    accessorKey: "project_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dự án" />,
    cell: ({ row }) => {
      const project = (row.original as TaskWithJoins).projects;
      if (!project) return <span className="text-muted-foreground">Chưa chọn</span>;
      
      const shortTitle = project.name && project.name.length > 20 ? project.name.substring(0, 20) + "..." : project.name || '';
      return (
        <div className="w-[120px]" title={project.name || ''}>
          <div className="font-medium text-sm truncate">{shortTitle}</div>
        </div>
      );
    }
  },
  { 
    accessorKey: "assignee_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Người phụ trách" />,
    cell: ({ row }) => {
      const assignee = (row.original as TaskWithJoins).assignee;
      if (!assignee) return <span className="text-muted-foreground">Chưa phân công</span>;
      
      const shortName = assignee.name && assignee.name.length > 15 ? assignee.name.substring(0, 15) + "..." : assignee.name || '';
      return (
        <div className="w-[120px]" title={assignee.name || ''}>
          <div className="font-medium text-sm truncate">{shortName}</div>
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="tasks"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa công việc"
        deleteLabel="Xóa công việc"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const taskColumns: ColumnDef<Task>[] = createTaskColumns();


