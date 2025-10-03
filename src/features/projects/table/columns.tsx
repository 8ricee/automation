"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Project } from "@/lib/supabase-types";

export const projectColumns: ColumnDef<Project>[] = [
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
  { accessorKey: "title", header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" /> },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  { accessorKey: "progress", header: ({ column }) => <DataTableColumnHeader column={column} title="Tiến độ (%)" /> },
  { accessorKey: "customer_id", header: ({ column }) => <DataTableColumnHeader column={column} title="Khách hàng" /> },
  { accessorKey: "project_manager_id", header: ({ column }) => <DataTableColumnHeader column={column} title="Quản lý dự án" /> },
  { accessorKey: "budget", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngân sách (VND)" /> },
  { accessorKey: "billable_rate", header: ({ column }) => <DataTableColumnHeader column={column} title="Tỷ lệ thanh toán" /> },
  { accessorKey: "start_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" /> },
  { accessorKey: "end_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" /> },
];


