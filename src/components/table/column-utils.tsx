import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "./data-table-column-header";
import { StatusBadge } from "@/components/ui/status-badge";

// Utility functions for consistent column rendering

export const formatCurrency = (amount: number | null | undefined): string => {
  if (!amount) return '-';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString('vi-VN');
  } catch {
    return date;
  }
};

export const truncateText = (text: string | null | undefined, maxLength: number = 25): string => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const formatId = (id: string | null | undefined): { short: string; full: string } => {
  if (!id) return { short: '', full: '' };
  return {
    short: id.length > 8 ? id.substring(0, 8) + '...' : id,
    full: id
  };
};

// Standard column definitions
export const createIdColumn = <T = Record<string, unknown>>(): ColumnDef<T> => ({
  accessorKey: "id",
  header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
  cell: ({ row }) => {
    const { short, full } = formatId(row.getValue("id") as string);
    return (
      <div className="w-[80px] font-mono text-xs" title={full}>
        {short}
      </div>
    );
  },
  meta: { className: "hidden sm:table-cell" }
});

export const createStatusColumn = <T = Record<string, unknown>>(accessorKey: string = "status", title: string = "Trạng thái"): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => <StatusBadge status={row.getValue(accessorKey)} />
});

export const createCurrencyColumn = <T = Record<string, unknown>>(accessorKey: string, title: string): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => {
    const amount = row.getValue(accessorKey) as number;
    return <span className="font-medium">{formatCurrency(amount)}</span>;
  }
});

export const createDateColumn = <T = Record<string, unknown>>(accessorKey: string, title: string): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => {
    const date = row.getValue(accessorKey) as string;
    return <span className="text-sm">{formatDate(date)}</span>;
  }
});

export const createTextColumn = <T = Record<string, unknown>>(
  accessorKey: string, 
  title: string, 
  maxLength: number = 25,
  className?: string
): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => {
    const text = row.getValue(accessorKey) as string;
    const truncated = truncateText(text, maxLength);
    return (
      <div className={className || "max-w-[200px]"} title={text || ''}>
        <span className="font-medium truncate">{truncated}</span>
      </div>
    );
  }
});

export const createProgressColumn = <T = Record<string, unknown>>(accessorKey: string = "progress_percentage", title: string = "Tiến độ"): ColumnDef<T> => ({
  accessorKey,
  header: ({ column }) => <DataTableColumnHeader column={column} title={title} />,
  cell: ({ row }) => {
    const progress = row.getValue(accessorKey) as number;
    return (
      <div className="flex items-center">
        <span className="text-sm font-medium">{progress || 0}%</span>
      </div>
    );
  }
});
