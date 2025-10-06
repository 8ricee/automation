"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createStatusColumn, createCurrencyColumn, createDateColumn } from "@/components/table/column-utils";
import type { Order } from "@/lib/supabase-types";

export const createOrderColumns = (
  onEdit?: (order: Order) => void,
  onDelete?: (order: Order) => void
): ColumnDef<Order>[] => [
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
  { accessorKey: "order_number", header: ({ column }) => <DataTableColumnHeader column={column} title="Số đơn" /> },
  createStatusColumn("status", "Trạng thái"),
  createDateColumn("order_date", "Ngày đặt"),
  createCurrencyColumn("total_amount", "Tổng tiền"),
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="orders"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa đơn hàng"
        deleteLabel="Xóa đơn hàng"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const orderColumns: ColumnDef<Order>[] = createOrderColumns();


