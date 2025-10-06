"use client";

import { Row } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditPermissionGuard, DeletePermissionGuard } from "@/hooks/use-permissions";

interface GenericRowActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  editLabel?: string;
  deleteLabel?: string;
  resource: string; // Resource name để kiểm tra permission
}

export function GenericRowActions<TData>({ 
  row, 
  onEdit, 
  onDelete, 
  editLabel = "Chỉnh sửa",
  deleteLabel = "Xóa",
  resource
}: GenericRowActionsProps<TData>) {
  const data = row.original;

  const handleEdit = () => {
    onEdit?.(data);
  };

  const handleDelete = () => {
    onDelete?.(data);
  };

  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <EditPermissionGuard resource={resource}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
            onClick={handleEdit}
            title={editLabel}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">{editLabel}</span>
          </Button>
        </EditPermissionGuard>
      )}
      {onDelete && (
        <DeletePermissionGuard resource={resource}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
            onClick={handleDelete}
            title={deleteLabel}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">{deleteLabel}</span>
          </Button>
        </DeletePermissionGuard>
      )}
    </div>
  );
}
