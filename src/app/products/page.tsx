import { DataTable } from "@/components/table/data-table";
import { productColumns } from "@/features/products/table/columns";
import { products } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function ProductsPage() {
  const data = products;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));
  const typeOptions = Array.from(new Set(data.map((x) => x.type).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={productColumns}
        toolbarConfig={{
          placeholder: "Tìm sản phẩm...",
          searchColumn: "name",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
            { column: "type", title: "Loại", options: typeOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm sản phẩm"
              fields={[
                { name: "name", label: "Tên" },
                { name: "price", label: "Giá", type: "number" },
                { name: "sku", label: "SKU" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
