"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Task } from "@/data/types";

export const taskColumns: ColumnDef<Task>[] = [
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
  { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />, cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div> },
  { accessorKey: "task_code", header: ({ column }) => <DataTableColumnHeader column={column} title="Mã" /> },
  { accessorKey: "title", header: ({ column }) => <DataTableColumnHeader column={column} title="Tiêu đề" /> },
  { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" /> },
  { accessorKey: "priority", header: ({ column }) => <DataTableColumnHeader column={column} title="Ưu tiên" /> },
  { accessorKey: "due_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Hạn" /> },
];


