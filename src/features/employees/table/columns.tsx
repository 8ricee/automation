"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import type { Employee } from "@/lib/supabase-types";

export const employeeColumns: ColumnDef<Employee>[] = [
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
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Họ tên" />, 
    cell: ({ row }) => <span className="max-w-[300px] truncate font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />, 
    cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("email")}</span>,
  },
  {
    accessorKey: "department",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phòng ban" />, 
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Chức danh" />, 
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Trạng thái" />, 
  },
  {
    accessorKey: "role",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vai trò" />,
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <span className={`px-2 py-1 text-xs rounded-full ${
          role === 'admin' ? 'bg-red-100 text-red-800' :
          role === 'manager' ? 'bg-blue-100 text-blue-800' :
          role === 'staff' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {getRoleLabel(role)}
        </span>
      );
    },
  },
];

function getRoleLabel(role: string): string {
  const roleLabels = {
    admin: "Quản trị viên",
    manager: "Quản lý", 
    staff: "Nhân viên",
    viewer: "Người xem"
  };
  
  return roleLabels[role as keyof typeof roleLabels] || role;
}


