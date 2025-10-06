import { DataTable } from "@/components/table/data-table";
import { projectColumns } from "@/features/projects";
import { projects } from "@/data/data";

export default async function AnalyticsPage() {
  // Transform data to match the expected schema
  const data = projects.map(project => ({
    id: project.id.toString(),
    created_at: null,
    updated_at: null,
    name: project.title, // Map title to name
    description: project.description || null,
    customer_id: project.customer_id?.toString() || null,
    project_manager_id: null,
    start_date: project.start_date || null,
    end_date: project.end_date || null,
    status: project.status as 'cancelled' | 'completed' | 'planning' | 'in_progress' | null,
    priority: 'medium' as const,
    budget: null,
    actual_cost: 0,
    progress_percentage: project.progress || 0,
    notes: null
  }));

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data || []}
        columns={projectColumns}
        toolbarConfig={{
          placeholder: "Tìm dự án...",
          searchColumn: "name",
          facetedFilters: [
            { column: "status", title: "Trạng thái", options: Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) })) },
          ],
        }}
      />
    </div>
  );
}
