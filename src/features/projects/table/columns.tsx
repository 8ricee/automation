"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Project } from "@/data/types";

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
  { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" /> },
  { accessorKey: "progress", header: ({ column }) => <DataTableColumnHeader column={column} title="Tiến độ (%)" /> },
  { accessorKey: "start_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Bắt đầu" /> },
  { accessorKey: "end_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Kết thúc" /> },
];


