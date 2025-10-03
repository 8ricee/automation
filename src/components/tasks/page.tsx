import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { taskSchema } from "./data/schema";

async function getTasks() {
  const data = await fs.readFile(path.join(process.cwd(), "/tasks/data/tasks.json"));

  const tasks = JSON.parse(data.toString());

  return z.array(taskSchema).parse(tasks);
}

export default async function TaskPage() {
  const tasks = await getTasks();

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable data={tasks} columns={columns} />
    </div>
  );
}
