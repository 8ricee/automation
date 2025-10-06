"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createStatusColumn, createTextColumn } from "@/components/table/column-utils";
import type { Product } from "@/lib/supabase-types";

export const createInventoryColumns = (
  onEdit?: (product: Product) => void,
  onDelete?: (product: Product) => void
): ColumnDef<Product>[] => [
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
  createTextColumn("name", "Sản phẩm", 25),
  { accessorKey: "sku", header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" /> },
  { accessorKey: "stock_quantity", header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho" /> },
  createStatusColumn("status", "Trạng thái"),
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="inventory"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa sản phẩm"
        deleteLabel="Xóa sản phẩm"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const inventoryColumns: ColumnDef<Product>[] = createInventoryColumns();


