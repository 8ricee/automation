"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { Task } from "@/data/types";

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
  { 
    accessorKey: "id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />, 
    cell: ({ row }) => {
      const fullId = row.getValue("id") as string;
      const shortId = fullId ? fullId.substring(0, 8) + "..." : "";
      return <div className="w-[80px] font-mono text-xs" title={fullId}>{shortId}</div>;
    }
  },
  { 
    accessorKey: "title", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const shortTitle = title.length > 25 ? title.substring(0, 25) + "..." : title;
      return (
        <div className="w-[200px]" title={title}>
          <div className="font-medium truncate">{shortTitle}</div>
        </div>
      );
    }
  },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  { 
    accessorKey: "priority", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ưu tiên" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("priority")} />
  },
  { 
    accessorKey: "due_date", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Hạn" />,
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string;
      return dueDate ? <span className="text-sm">{dueDate}</span> : <span className="text-muted-foreground">-</span>;
    }
  },
  { 
    accessorKey: "project_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dự án" />,
    cell: ({ row }) => {
      const project = row.original.projects;
      if (!project) return <span className="text-muted-foreground">Chưa chọn</span>;
      
      const shortTitle = project.title.length > 20 ? project.title.substring(0, 20) + "..." : project.title;
      return (
        <div className="w-[120px]" title={project.title}>
          <div className="font-medium text-sm truncate">{shortTitle}</div>
        </div>
      );
    }
  },
  { 
    accessorKey: "assignee_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Người phụ trách" />,
    cell: ({ row }) => {
      const assignee = row.original.assignee;
      if (!assignee) return <span className="text-muted-foreground">Chưa phân công</span>;
      
      const shortName = assignee.name.length > 15 ? assignee.name.substring(0, 15) + "..." : assignee.name;
      return (
        <div className="w-[120px]" title={assignee.name}>
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


