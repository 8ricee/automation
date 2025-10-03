"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { Quote } from "@/lib/supabase-types";

export const createQuoteColumns = (
  onEdit?: (quote: Quote) => void,
  onDelete?: (quote: Quote) => void
): ColumnDef<Quote>[] => [
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
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
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
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa báo giá"
        deleteLabel="Xóa báo giá"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const quoteColumns: ColumnDef<Quote>[] = createQuoteColumns();


