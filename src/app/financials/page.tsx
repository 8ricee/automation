import { DataTable } from "@/components/table/data-table";
import { quoteColumns } from "@/features/quotes/table/columns";
import { invoices, quotes } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function FinancialsPage() {
  const data = quotes;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={quoteColumns}
        toolbarConfig={{
          placeholder: "Tìm báo giá...",
          searchColumn: "quote_number",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm báo giá"
              fields={[
                { name: "quote_number", label: "Số báo giá" },
                { name: "issue_date", label: "Ngày phát hành", type: "date" },
                { name: "total_amount", label: "Tổng tiền", type: "number" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
