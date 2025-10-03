import { DataTable } from "@/components/table/data-table";
import { productColumns } from "@/features/products";
import { products } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function ProductsPage() {
  const data = products;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));
  const typeOptions = Array.from(new Set(data.map((x) => x.type).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Sản phẩm</h1>
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
    </div>
  );
}
