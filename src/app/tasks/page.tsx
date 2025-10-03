import { DataTable } from "@/components/table/data-table";
import { taskColumns } from "@/features/tasks/table/columns";
import { tasks } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function TaskPage() {
  const data = tasks;
  const statusOptions = Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));
  const priorityOptions = Array.from(new Set(data.map((x) => x.priority).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={taskColumns}
        toolbarConfig={{
          placeholder: "Tìm công việc...",
          searchColumn: "title",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: statusOptions },
            { column: "priority", title: "Ưu tiên", options: priorityOptions },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm công việc"
              fields={[
                { name: "title", label: "Tiêu đề" },
                { name: "due_date", label: "Hạn", type: "date" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
