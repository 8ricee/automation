"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createStatusColumn, createCurrencyColumn, createTextColumn } from "@/components/table/column-utils";
import type { Product } from "@/lib/supabase-types";

export const createProductColumns = (
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
  createTextColumn("name", "Tên sản phẩm", 30),
  createCurrencyColumn("price", "Giá"),
  { 
    accessorKey: "category", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
    meta: { className: "hidden md:table-cell" }
  },
  { 
    accessorKey: "stock_quantity", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho" />,
    meta: { className: "hidden lg:table-cell" }
  },
  createStatusColumn("status", "Trạng thái"),
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="products"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa sản phẩm"
        deleteLabel="Xóa sản phẩm"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const productColumns: ColumnDef<Product>[] = createProductColumns();
