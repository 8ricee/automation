import { DataTable } from "@/components/table/data-table";
import { customerColumns } from "@/features/customers";
import { customers } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function CustomersPage() {
  const data = customers;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Khách hàng</h1>
        <DataTable
          data={data}
          columns={customerColumns}
          toolbarConfig={{
            placeholder: "Tìm khách hàng...",
            searchColumn: "name",
            facetedFilters: [
              { column: "status", title: "Trạng thái", options: statusOptions },
            ],
            actionsRender: (
              <CreateRecordButton
                title="Thêm khách hàng"
                fields={[
                  { name: "name", label: "Tên" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "company", label: "Công ty" },
                ]}
              />
            ),
          }}
        />
      </div>
    </div>
  );
}
