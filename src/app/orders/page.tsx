"use client";

import { useState } from "react";
import { DataTable } from "@/components/table/data-table";
import { createOrderColumns } from "@/features/orders/table/columns";
import { useOrders } from "@/features/orders/model/useOrders";
import { CreateRecordButton } from "@/components/table/create-record-button";
import { GenericEditDialog } from "@/components/table/generic-edit-dialog";
import { OrderForm } from "@/features/orders/ui/OrderForm";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import type { Order } from "@/lib/supabase-types";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

export default function OrdersPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    order: Order | null;
    isLoading: boolean;
  }>({
    open: false,
    order: null,
    isLoading: false
  });
  const { orders: data, loading, error, refetch, create: createOrder, update: updateOrder, delete: deleteOrder } = useOrders();

  const handleCreateOrder = async (values: any) => {
    try {
      const orderData = {
        order_number: values.order_number || '',
        customer_id: values.customer_id || null,
        quote_id: null,
        status: values.status || 'pending',
        order_date: new Date().toISOString().split('T')[0],
        required_delivery_date: null,
        subtotal: 0,
        vat_rate: 0.1,
        vat_amount: 0,
        tax_amount: 0,
        discount_amount: 0,
        shipping_fee: 0,
        total_amount: 0,
        billing_address: null,
        shipping_address: null,
        payment_method: null,
        tracking_number: null,
        shipping_provider: null,
        notes: null,
        delivery_date: null,
        payment_status: 'pending' as const,
        created_by: null,
        updated_by: null
      };
      await createOrder(orderData);
      toast.success("Đã tạo đơn hàng thành công!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      toast.error(`Lỗi tạo đơn hàng: ${(error as Error).message}`);
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
  };

  const handleDeleteOrder = (order: Order) => {
    setDeleteDialog({
      open: true,
      order,
      isLoading: false
    });
  };

  const confirmDeleteOrder = async () => {
    if (!deleteDialog.order) return;
    
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteOrder(deleteDialog.order.id);
      toast.success("✅ Đã xóa đơn hàng thành công!");
      setRefreshTrigger(prev => prev + 1);
      setDeleteDialog({
        open: false,
        order: null,
        isLoading: false
      });
    } catch (error) {
      toast.error(`❌ Lỗi: ${(error as Error).message}`);
      setDeleteDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleUpdateOrder = async (orderData: any) => {
    if (!editingOrder) return;
    
    try {
      await updateOrder(editingOrder.id, orderData);
      toast.success("✅ Đã cập nhật đơn hàng thành công!");
      setEditingOrder(null);
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
          <p className="mt-2 text-sm text-muted-foreground">Đang tải đơn hàng...</p>
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
            Không thể tải danh sách đơn hàng. Vui lòng kiểm tra kết nối và thử lại.
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
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">Đơn hàng</h1>
          </div>

          <DataTable
            data={data}
            columns={createOrderColumns(handleEditOrder, handleDeleteOrder)}
            toolbarConfig={{
              placeholder: "Tìm đơn hàng...",
              searchColumn: "order_number",
              facetedFilters: [
                { column: "status", title: "Trạng thái", options: statusOptions },
              ],
              actionsRender: (
                <CreateRecordButton
                  title="Tạo đơn hàng"
                  fields={[
                    { name: "order_number", label: "Số đơn hàng", type: "text" },
                    { name: "customer_id", label: "ID Khách hàng", type: "text" },
                    { name: "status", label: "Trạng thái", type: "text" },
                  ]}
                  onCreate={handleCreateOrder}
                />
              ),
            }}
          />

          {/* Edit Dialog */}
          <GenericEditDialog
            data={editingOrder}
            title="Chỉnh sửa đơn hàng"
            open={!!editingOrder}
            onOpenChange={(open) => !open && setEditingOrder(null)}
          >
            {editingOrder && (
              <OrderForm
                order={editingOrder}
                onSubmit={handleUpdateOrder}
                onCancel={() => setEditingOrder(null)}
              />
            )}
            </GenericEditDialog>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmationDialog
              open={deleteDialog.open}
              onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
              onConfirm={confirmDeleteOrder}
              title="Xóa đơn hàng"
              description="Hành động này không thể hoàn tác. Đơn hàng sẽ bị xóa vĩnh viễn."
              itemName={deleteDialog.order ? `"${deleteDialog.order.order_number}"` : undefined}
              isLoading={deleteDialog.isLoading}
            />
          </div>
        </div>
      </div>
    );
}

function getStatusLabel(status: string): string {
  const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý", 
    shipped: "Đã giao hàng",
    delivered: "Đã nhận hàng",
    cancelled: "Đã hủy",
    returned: "Trả hàng"
  };
  
  return statusLabels[status as keyof typeof statusLabels] || status;
}
