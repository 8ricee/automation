"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { Project } from "@/lib/supabase-types";

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
  { 
    accessorKey: "title", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Dự án" />,
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      const description = row.original.description;
      const shortTitle = title.length > 20 ? title.substring(0, 20) + "..." : title;
      const shortDescription = description && description.length > 30 ? description.substring(0, 30) + "..." : description;
      
      return (
        <div className="w-[150px]" title={title}>
          <div className="font-medium truncate">{shortTitle}</div>
          {shortDescription && <div className="text-xs text-muted-foreground truncate" title={description}>{shortDescription}</div>}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  { accessorKey: "progress", header: ({ column }) => <DataTableColumnHeader column={column} title="Tiến độ (%)" /> },
  { 
    accessorKey: "customer_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Khách hàng" />,
    cell: ({ row }) => {
      const customer = row.original.customers;
      if (!customer) return <span className="text-muted-foreground">Chưa chọn</span>;
      
      const shortName = customer.name.length > 20 ? customer.name.substring(0, 20) + "..." : customer.name;
      const shortCompany = customer.company && customer.company.length > 25 ? customer.company.substring(0, 25) + "..." : customer.company;
      
      return (
        <div className="w-[120px]" title={customer.name}>
          <div className="font-medium text-sm truncate">{shortName}</div>
          {shortCompany && <div className="text-xs text-muted-foreground truncate" title={customer.company}>{shortCompany}</div>}
        </div>
      );
    }
  },
  { 
    accessorKey: "project_manager_id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Quản lý dự án" />,
    cell: ({ row }) => {
      const projectManager = row.original.project_manager;
      
      if (!projectManager) return <span className="text-muted-foreground">Chưa phân công</span>;
      
      const shortName = projectManager.name.length > 18 ? projectManager.name.substring(0, 18) + "..." : projectManager.name;
      const shortTitle = projectManager.title && projectManager.title.length > 22 ? projectManager.title.substring(0, 22) + "..." : projectManager.title;
      
      return (
        <div className="w-[120px]" title={projectManager.name}>
          <div className="font-medium text-sm truncate">{shortName}</div>
          {shortTitle && <div className="text-xs text-muted-foreground truncate" title={projectManager.title}>{shortTitle}</div>}
        </div>
      );
    }
  },
  { accessorKey: "budget", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngân sách (VND)" /> },
  { accessorKey: "billable_rate", header: ({ column }) => <DataTableColumnHeader column={column} title="Tỷ lệ thanh toán" /> },
  { accessorKey: "start_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" /> },
  { accessorKey: "end_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" /> },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
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


