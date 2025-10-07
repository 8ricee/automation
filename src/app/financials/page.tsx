"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createQuoteColumns } from "@/features/quotes/table/columns";
import { Loading } from "@/components/ui/loading";
import { usePermissions } from "@/hooks/use-permissions";
import { useQuotes } from "@/features/quotes/model/useQuotes";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { QuoteForm } from "@/features/quotes/ui/QuoteForm";
import { toast } from "sonner";
import type { Quote } from "@/lib/supabase-types";

export default function FinancialsPage() {
  const { hasPermission } = usePermissions();
  const { quotes, loading, error, update: updateQuote, delete: deleteQuote } = useQuotes();
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  if (loading) {
    return <Loading message="Đang tải dữ liệu tài chính..." />;
  }

  if (error) {
    return <div>Error loading quotes</div>;
  }

  const statusOptions = Array.from(new Set((quotes || []).map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa báo giá "${quote.quote_number}"?`)) {
      return;
    }

    try {
      await deleteQuote(quote.id);
      toast.success("Đã xóa báo giá thành công!");
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  const handleUpdateQuote = async (quoteData: Record<string, unknown>) => {
    if (!editingQuote) return;

    try {
      await updateQuote(editingQuote.id, quoteData);
      toast.success("Đã cập nhật báo giá thành công!");
      setEditingQuote(null);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={quotes || []}
        columns={createQuoteColumns(handleEditQuote, handleDeleteQuote)}
        toolbarConfig={{
          placeholder: "Tìm báo giá...",
          searchColumn: "quote_number",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            hasPermission('financials:create') ? (
              <CreateRecordButton
                title="Thêm báo giá"
                resource="quotes"
                fields={[
                  { name: "quote_number", label: "Số báo giá" },
                  { name: "issue_date", label: "Ngày phát hành", type: "date" },
                  { name: "total_amount", label: "Tổng tiền", type: "number" },
                ]}
                onCreate={() => { }}
              />
            ) : null
          ),
        }}
      />

      {/* Edit Dialog */}
      <GenericEditDialog
        data={editingQuote}
        title="Chỉnh sửa báo giá"
        open={!!editingQuote}
        onOpenChange={(open) => !open && setEditingQuote(null)}
      >
        {editingQuote && (
          <QuoteForm
            quote={editingQuote}
            onSubmit={handleUpdateQuote}
            onCancel={() => setEditingQuote(null)}
          />
        )}
      </GenericEditDialog>
    </div>
  );
}

