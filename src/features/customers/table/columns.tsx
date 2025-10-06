"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { Customer } from "@/lib/supabase-types";

export const createCustomerColumns = (
  onEdit?: (customer: Customer) => void,
  onDelete?: (customer: Customer) => void
): ColumnDef<Customer>[] => [
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
    },
    meta: { className: "hidden sm:table-cell" }
  },
  { 
    accessorKey: "name", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Tên" />
  },
  { 
    accessorKey: "email", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    meta: { className: "hidden md:table-cell" }
  },
  { 
    accessorKey: "company", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Công ty" />,
    meta: { className: "hidden lg:table-cell" }
  },
  { 
    accessorKey: "status", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />,
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  { 
    accessorKey: "date_added", 
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ngày thêm" />,
    meta: { className: "hidden lg:table-cell" }
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa khách hàng"
        deleteLabel="Xóa khách hàng"
        resource="customers"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const customerColumns: ColumnDef<Customer>[] = createCustomerColumns();


