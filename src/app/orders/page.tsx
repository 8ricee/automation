import { DataTable } from "@/components/table/data-table";
import { orderColumns } from "@/features/orders/table/columns";
import { orders } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function OrdersPage() {
  const data = orders;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={orderColumns}
        toolbarConfig={{
          placeholder: "Tìm đơn hàng...",
          searchColumn: "order_number",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm đơn hàng"
              fields={[
                { name: "order_number", label: "Số đơn" },
                { name: "order_date", label: "Ngày đặt", type: "date" },
                { name: "total_amount", label: "Tổng tiền", type: "number" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
