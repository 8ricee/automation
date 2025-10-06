"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/ui/status-badge";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import type { Supplier } from "../api/supplierApi";

export const createSupplierColumns = (
  onEdit?: (supplier: Supplier) => void,
  onDelete?: (supplier: Supplier) => void
): ColumnDef<Supplier>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tên nhà cung cấp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{supplier.name}</span>
          {supplier.company && (
            <span className="text-sm text-muted-foreground">{supplier.company}</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "contact_person",
    header: "Người liên hệ",
    cell: ({ row }) => {
      const contactPerson = row.getValue("contact_person") as string;
      return contactPerson || "-";
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return email || "-";
    },
  },
  {
    accessorKey: "phone",
    header: "Số điện thoại",
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone || "-";
    },
  },
  {
    accessorKey: "city",
    header: "Thành phố",
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="flex flex-col">
          {supplier.city && <span>{supplier.city}</span>}
          {supplier.state && <span className="text-sm text-muted-foreground">{supplier.state}</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa nhà cung cấp"
        deleteLabel="Xóa nhà cung cấp"
        resource="suppliers"
      />
    ),
  },
];

// Export default columns for backward compatibility
export const columns = createSupplierColumns();
