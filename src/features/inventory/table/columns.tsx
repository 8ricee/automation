"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Product } from "@/data/types";

export const inventoryColumns: ColumnDef<Product>[] = [
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
  { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="ID" /> },
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Sản phẩm" /> },
  { accessorKey: "sku", header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" /> },
  { accessorKey: "stock", header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho" /> },
  { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" /> },
];


