"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
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
  { accessorKey: "order_number", header: ({ column }) => <DataTableColumnHeader column={column} title="Số đơn" /> },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  { accessorKey: "order_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đặt" /> },
  { 
    accessorKey: "total_amount", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number;
      return amount ? new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount) : '-';
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
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

function getStatusLabel(status: string): string {
  const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý", 
    shipped: "Đã giao hàng",
    delivered: "Đã nhận hàng",
    cancelled: "Đã hủy",
    returned: "Trả hàng"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}

