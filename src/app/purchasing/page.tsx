"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createPurchaseOrderColumns } from "@/features/purchasing/table/columns";
import { usePurchasing } from "@/features/purchasing/model/usePurchasing";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { InventoryForm } from "@/features/inventory/ui/InventoryForm";
import { toast } from "sonner";
import type { PurchaseOrder } from "@/data/types";

export default function PurchasingPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const { purchaseOrders: data, loading, error, refetch, create: createPurchaseOrder, update: updatePurchaseOrder, delete: deletePurchaseOrder } = usePurchasing();

  const handleCreatePurchaseOrder = async (values: any) => {
    try {
      const poData = {
        po_number: values.po_number || '',
        supplier_id: values.supplier_id || '',
        status: values.status || 'draft',
        po_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        total_amount: values.total_amount || 0,
        notes: values.notes || '',
        created_by: null,
        approved_by: null,
        approved_at: null
      };
      await createPurchaseOrder(poData);
      toast.success("Đã tạo đơn hàng mua thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi tạo đơn hàng mua: ${(error as Error).message}`);
    }
  };

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
  };

  const handleDeletePurchaseOrder = async (purchaseOrder: PurchaseOrder) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn mua hàng "${purchaseOrder.po_number}"?`)) {
      return;
    }
    
    try {
      await deletePurchaseOrder(purchaseOrder.id);
      toast.success("✅ Đã xóa đơn mua hàng thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    }
  };

  const handleUpdatePurchaseOrder = async (purchaseOrderData: any) => {
    if (!editingPurchaseOrder) return;
    
    try {
      await updatePurchaseOrder(editingPurchaseOrder.id, purchaseOrderData);
      toast.success("✅ Đã cập nhật đơn mua hàng thành công!");
      setEditingPurchaseOrder(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Đang tải đơn hàng mua...</p>
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
            Không thể tải danh sách đơn hàng mua. Vui lòng kiểm tra kết nối và thử lại.
          </p>
          <p className="text-xs mt-2 font-mono">Error: {error}</p>
        </div>
      </div>
    );
  }

  try {
    // Get unique status options for filtering
    const statusOptions = Array.from(new Set((data || []).map((x) => x.status).filter(Boolean)))
      .map((v) => ({ 
        label: getStatusLabel(v as string), 
        value: v as string 
      }));

    // Get pending and overdue orders
    const pendingCount = (data || []).filter(order => order.status === 'pending').length;
    const today = new Date().toISOString().split('T')[0];
    const expiredCount = (data || []).filter(order => 
      order.expected_delivery_date && order.expected_delivery_date < today
    ).length;

    return (
      <div className="w-full min-w-0 overflow-x-auto">
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
          <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                Đơn hàng mua
              </h1>
            </div>

            {/* Purchasing Orders Table */}
            <DataTable
              data={data || []}
              columns={createPurchaseOrderColumns(handleEditPurchaseOrder, handleDeletePurchaseOrder)}
              toolbarConfig={{
                placeholder: "Tìm PO...",
                searchColumn: "po_number",
                facetedFilters: [
                  { 
                    column: "status", 
                    title: "Trạng thái", 
                    options: statusOptions,
                  },
                ],
                actionsRender: (
                  <CreateRecordButton
                    title="Tạo đơn hàng mua"
                    fields={[
                      { name: "po_number", label: "Số PO", type: "text" },
                      { name: "supplier_id", label: "Nhà cung cấp", type: "text" },
                      { name: "status", label: "Trạng thái", type: "text" },
                      { name: "total_amount", label: "Tổng tiền", type: "number" },
                      { name: "notes", label: "Ghi chú", type: "text" },
                    ]}
                    onCreate={handleCreatePurchaseOrder}
                  />
                ),
              }}
            />

            {/* Edit Dialog */}
            <GenericEditDialog
              data={editingPurchaseOrder}
              title="Chỉnh sửa đơn mua hàng"
              open={!!editingPurchaseOrder}
              onOpenChange={(open) => !open && setEditingPurchaseOrder(null)}
            >
              {editingPurchaseOrder && (
                <InventoryForm
                  inventoryItem={editingPurchaseOrder as any}
                  onSubmit={handleUpdatePurchaseOrder}
                  onCancel={() => setEditingPurchaseOrder(null)}
                />
              )}
            </GenericEditDialog>
          </div>
        </div>
      </div>
    );
  } catch (innerError) {
    console.error('Unexpected error:', innerError);
    throw innerError;
  }
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    draft: "Nháp",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    ordered: "Đã đặt hàng",
    received: "Đã nhận hàng",
    cancelled: "Hủy"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
