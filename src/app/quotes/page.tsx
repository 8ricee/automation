import { columns } from "@/components/tasks/columns";
import { DataTable } from "@/components/tasks/data-table";
import { tasksData } from "@/data/tasks";

export default async function TaskPage() {
  const tasks = tasksData;

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable data={tasks} columns={columns} />
    </div>
  );
}
