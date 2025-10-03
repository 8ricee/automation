import { DataTable } from "@/components/table/data-table";
import { inventoryColumns } from "@/features/inventory";
import { products } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function InventoryPage() {
  const data = products;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={inventoryColumns}
        toolbarConfig={{
          placeholder: "Tìm trong kho...",
          searchColumn: "name",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Nhập kho"
              fields={[
                { name: "name", label: "Sản phẩm" },
                { name: "sku", label: "SKU" },
                { name: "stock", label: "Số lượng", type: "number" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
