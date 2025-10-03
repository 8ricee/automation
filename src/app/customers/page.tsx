import { DataTable } from "@/components/table/data-table";
import { customerColumns } from "@/features/customers/table/columns";
import { customers } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function CustomersPage() {
  const data = customers;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
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
  );
}
