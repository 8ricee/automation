import { DataTable } from "@/components/table/data-table";
import { purchaseOrderColumns } from "@/features/purchasing/table/columns";
import { purchaseOrders } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function PurchasingPage() {
  const data = purchaseOrders;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={purchaseOrderColumns}
        toolbarConfig={{
          placeholder: "Tìm PO...",
          searchColumn: "po_number",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Tạo PO"
              fields={[
                { name: "po_number", label: "Số PO" },
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
