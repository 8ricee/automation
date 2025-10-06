"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createStatusColumn, createTextColumn, createProgressColumn } from "@/components/table/column-utils";
import type { Project } from "@/lib/supabase-types";

// Extended Project type with joined data
type ProjectWithJoins = Project & {
  customers?: { name: string; company?: string };
  project_manager?: { name: string; position?: string };
};

export const createProjectColumns = (
  onEdit?: (project: Project) => void,
  onDelete?: (project: Project) => void
): ColumnDef<Project>[] => [
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
  createTextColumn("name", "Dự án", 20),
  createStatusColumn("status", "Trạng thái"),
  createProgressColumn("progress_percentage", "Tiến độ"),
  { 
    accessorKey: "customer_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Khách hàng" />,
    cell: ({ row }) => {
      const customer = (row.original as ProjectWithJoins).customers;
      if (!customer) return <span className="text-muted-foreground">Chưa chọn</span>;
      
      const shortName = customer.name && customer.name.length > 20 ? customer.name.substring(0, 20) + "..." : customer.name || '';
      const shortCompany = customer.company && customer.company.length > 25 ? customer.company.substring(0, 25) + "..." : customer.company || '';
      
      return (
        <div className="w-[120px]" title={customer.name || ''}>
          <div className="font-medium text-sm truncate">{shortName}</div>
          {shortCompany && <div className="text-xs text-muted-foreground truncate" title={customer.company || ''}>{shortCompany}</div>}
        </div>
      );
    }
  },
  { 
    accessorKey: "project_manager_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Quản lý dự án" />,
    cell: ({ row }) => {
      const projectManager = (row.original as ProjectWithJoins).project_manager;
      
      if (!projectManager) return <span className="text-muted-foreground">Chưa phân công</span>;
      
      const shortName = projectManager.name && projectManager.name.length > 18 ? projectManager.name.substring(0, 18) + "..." : projectManager.name || '';
      const shortPosition = projectManager.position && projectManager.position.length > 22 ? projectManager.position.substring(0, 22) + "..." : projectManager.position || '';
      
      return (
        <div className="w-[120px]" title={projectManager.name || ''}>
          <div className="font-medium text-sm truncate">{shortName}</div>
          {shortPosition && <div className="text-xs text-muted-foreground truncate" title={projectManager.position || ''}>{shortPosition}</div>}
        </div>
      );
    }
  },
  { 
    accessorKey: "budget", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngân sách (VND)" />,
    cell: ({ row }) => {
      const budget = row.getValue("budget") as number;
      return (
        <div className="text-sm">
          {budget ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(budget) : '-'}
        </div>
      );
    }
  },
  { 
    accessorKey: "start_date", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" />,
    cell: ({ row }) => {
      const startDate = row.getValue("start_date") as string;
      return (
        <div className="text-sm">
          {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : '-'}
        </div>
      );
    }
  },
  { 
    accessorKey: "end_date", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" />,
    cell: ({ row }) => {
      const endDate = row.getValue("end_date") as string;
      return (
        <div className="text-sm">
          {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : '-'}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="projects"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa dự án"
        deleteLabel="Xóa dự án"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const projectColumns: ColumnDef<Project>[] = createProjectColumns();


