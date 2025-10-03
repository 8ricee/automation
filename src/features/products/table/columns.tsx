"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Product } from "@/data/types";

export const productColumns: ColumnDef<Product>[] = [
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
    accessorKey: "id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />, 
    cell: ({ row }) => <div className="w-[60px]">{row.getValue("id")}</div>,
    meta: { className: "hidden sm:table-cell" }
  },
  { 
    accessorKey: "name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên sản phẩm" />
  },
  { 
    accessorKey: "price", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Giá" />
  },
  { 
    accessorKey: "type", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Loại" />,
    meta: { className: "hidden md:table-cell" }
  },
  { 
    accessorKey: "stock", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho" />,
    meta: { className: "hidden lg:table-cell" }
  },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />
  },
];


