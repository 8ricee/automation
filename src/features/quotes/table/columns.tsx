"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Quote } from "@/lib/supabase-types";

export const quoteColumns: ColumnDef<Quote>[] = [
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
  { accessorKey: "quote_number", header: ({ column }) => <DataTableColumnHeader column={column} title="Số báo giá" /> },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          status === 'draft' ? 'bg-gray-100 text-gray-800' :
          status === 'sent' ? 'bg-blue-100 text-blue-800' :
          status === 'accepted' ? 'bg-green-100 text-green-800' :
          status === 'rejected' ? 'bg-red-100 text-red-800' :
          status === 'expired' ? 'bg-orange-100 text-orange-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getStatusLabel(status)}
        </span>
      );
    },
  },
  { accessorKey: "issue_date", header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày phát hành" /> },
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
    draft: "Nháp",
    sent: "Đã gửi",
    accepted: "Đã chấp nhận", 
    rejected: "Từ chối",
    expired: "Hết hạn"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}


