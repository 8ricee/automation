"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
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
  { 
    accessorKey: "id", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />, 
    cell: ({ row }) => {
      const fullId = row.getValue("id") as string;
      const shortId = fullId ? fullId.substring(0, 8) + "..." : "";
      return <div className="w-[80px] font-mono text-xs" title={fullId}>{shortId}</div>;
    }
  },
  { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Sản phẩm" /> },
  { accessorKey: "sku", header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" /> },
  { accessorKey: "stock", header: ({ column }) => <DataTableColumnHeader column={column} title="Tồn kho" /> },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
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


