"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { GenericRowActions } from "@/components/table/generic-row-actions";
import { createIdColumn, createTextColumn, createStatusColumn } from "@/components/table/column-utils";
import type { Employee } from "@/lib/supabase-types";

export const createEmployeeColumns = (
  onEdit?: (employee: Employee) => void,
  onDelete?: (employee: Employee) => void
): ColumnDef<Employee>[] => [
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
  createTextColumn("name", "Họ tên", 30),
  createTextColumn("email", "Email", 30, "hidden md:table-cell"),
  createTextColumn("position", "Chức vụ", 25, "hidden sm:table-cell"),
  createTextColumn("department", "Phòng ban", 20, "hidden lg:table-cell"),
  createStatusColumn("status", "Trạng thái"),
  {
    id: "actions",
    cell: ({ row }) => (
      <GenericRowActions
        row={row}
        resource="employees"
        onEdit={onEdit}
        onDelete={onDelete}
        editLabel="Chỉnh sửa nhân viên"
        deleteLabel="Xóa nhân viên"
      />
    ),
  },
];

// Default columns without actions for backward compatibility
export const employeeColumns: ColumnDef<Employee>[] = createEmployeeColumns();



