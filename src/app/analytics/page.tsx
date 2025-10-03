import { DataTable } from "@/components/table/data-table";
import { projectColumns } from "@/features/projects/table/columns";
import { projects } from "@/data/data";

export default async function AnalyticsPage() {
  const data = projects;

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={projectColumns}
        toolbarConfig={{
          placeholder: "Tìm dự án...",
          searchColumn: "title",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) })) },
          ],
        }}
      />
    </div>
  );
}
