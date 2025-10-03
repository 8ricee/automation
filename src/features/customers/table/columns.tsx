"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Customer } from "@/data/types";

export const customerColumns: ColumnDef<Customer>[] = [
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
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" /> },
  { accessorKey: "email", header: ({ column }) => <DataTableColumnHeader column={column} title="Email" /> },
  { accessorKey: "company", header: ({ column }) => <DataTableColumnHeader column={column} title="Công ty" /> },
  { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" /> },
  { accessorKey: "date_added", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày thêm" /> },
];


