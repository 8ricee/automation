"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { PurchaseOrder } from "@/lib/supabase-types";

export const createPurchaseOrderColumns = (
  onEdit?: (purchaseOrder: PurchaseOrder) => void,
  onDelete?: (purchaseOrder: PurchaseOrder) => void
): ColumnDef<PurchaseOrder>[] => [
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
  {
    accessorKey: "po_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Số PO" />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày đặt" />,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tổng tiền" />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="purchasing"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa đơn mua hàng"
        deleteLabel="Xóa đơn mua hàng"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = createPurchaseOrderColumns();
