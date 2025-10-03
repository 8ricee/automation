"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Order } from "@/data/types";

export const orderColumns: ColumnDef<Order>[] = [
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
  { accessorKey: "order_number", header: ({ column }) => <DataTableColumnHeader column={column} title="Số đơn" /> },
  { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" /> },
  { accessorKey: "order_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đặt" /> },
  { accessorKey: "total_amount", header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" /> },
];


