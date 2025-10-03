import { DataTable } from "@/components/table/data-table";
import { projectColumns } from "@/features/projects/table/columns";
import { projects } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function ProjectsPage() {
  const data = projects;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={projectColumns}
        toolbarConfig={{
          placeholder: "Tìm dự án...",
          searchColumn: "title",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm dự án"
              fields={[
                { name: "title", label: "Tiêu đề" },
                { name: "start_date", label: "Bắt đầu", type: "date" },
                { name: "end_date", label: "Kết thúc", type: "date" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
