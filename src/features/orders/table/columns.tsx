"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Order } from "@/lib/supabase-types";

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
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
          status === 'processing' ? 'bg-purple-100 text-purple-800' :
          status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
          status === 'delivered' ? 'bg-green-100 text-green-800' :
          status === 'cancelled' ? 'bg-red-100 text-red-800' :
          status === 'returned' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getStatusLabel(status)}
        </span>
      );
    },
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
];

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

