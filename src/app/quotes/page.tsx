"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createQuoteColumns } from "@/features/quotes/table/columns";
import { useQuotes } from "@/features/quotes/model/useQuotes";
import { Button } from "@/components/ui/button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { QuoteForm } from "@/features/quotes/ui/QuoteForm";
import { toast } from "sonner";
import type { Quote } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function QuotesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    quote: Quote | null;
    isLoading: boolean;
  }>({
    open: false,
    quote: null,
    isLoading: false
  });
  const { quotes: data, loading, error, refetch, create: createQuote, update: updateQuote, delete: deleteQuote } = useQuotes();

  const handleCreateQuote = async (values: any) => {
    try {
      const { items, ...quoteData } = values;
      const createdQuote = await createQuote(quoteData);
      
      // TODO: Create quote items if items exist
      // This would require a separate API call to create quote_items
      
      toast.success("Đã tạo báo giá thành công!");
      setRefreshTrigger(prev => prev + 1);
      setEditingQuote(null);
    } catch (error) {
      toast.error(`Lỗi tạo báo giá: ${(error as Error).message}`);
    }
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
  };

  const handleDeleteQuote = (quote: Quote) => {
    setDeleteDialog({
      open: true,
      quote,
      isLoading: false
    });
  };

  const confirmDeleteQuote = async () => {
    if (!deleteDialog.quote) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteQuote(deleteDialog.quote.id);
      toast.success("Đã xóa báo giá thành công!");
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialog({
        open: false,
        quote: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateQuote = async (quoteData: any) => {
    if (!editingQuote) return;
    
    try {
      await updateQuote(editingQuote.id, quoteData);
      toast.success("Đã cập nhật báo giá thành công!");
      setEditingQuote(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải báo giá...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="bg-red-100 text-red-800 p-4 rounded-lg">
          <h3 className="font-semibold">Lỗi tải dữ liệu</h3>
          <p className="text-sm mt-1">
            Không thể tải danh sách báo giá. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean)))
    .map((v) => ({ label: getStatusLabel(v as string), value: v as string }));

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Báo giá</h1>
          </div>

          <DataTable
            data={data}
            columns={createQuoteColumns(handleEditQuote, handleDeleteQuote)}
            toolbarConfig={{
              placeholder: "Tìm báo giá...",
              searchColumn: "quote_number",
              facetedFilters: [
                { column: "status", title: "Trạng thái", options: statusOptions },
              ],
              actionsRender: (
                <Button
                  onClick={() => setEditingQuote({} as Quote)}
                  className=""
                >
                  Tạo báo giá
                </Button>
              ),
            }}
          />

          {/* Create/Edit Dialog */}
          <GenericEditDialog
            data={editingQuote}
            title={editingQuote?.id ? "Chỉnh sửa báo giá" : "Tạo báo giá"}
            open={!!editingQuote}
            onOpenChange={(open) => !open && setEditingQuote(null)}
          >
            {editingQuote && (
              <QuoteForm
                quote={editingQuote.id ? editingQuote : undefined}
                onSubmit={editingQuote.id ? handleUpdateQuote : handleCreateQuote}
                onCancel={() => setEditingQuote(null)}
                inDialog={true}
              />
            )}
          </GenericEditDialog>

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialog.open}
            onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
            onConfirm={confirmDeleteQuote}
            title="Xóa báo giá"
            description="Hành động này không thể hoàn tác. Báo giá sẽ bị xóa vĩnh viễn."
            itemName={deleteDialog.quote ? `"${deleteDialog.quote.quote_number}"` : undefined}
            isLoading={deleteDialog.isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    draft: "Đang nháp",
    sent: "Đã gửi",
    accepted: "Đã chấp nhận", 
    rejected: "Từ chối",
    expired: "Hết hạn"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
