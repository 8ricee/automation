"use client";

import { DataTable } from "@/components/table/data-table";
import { projectColumns } from "@/features/projects";
import { useProjects } from "@/features/projects/model/useProjects";

export default function AnalyticsPage() {
  const { data: projects, loading, error } = useProjects();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading projects</div>;
  }

  // Transform data to match the expected schema
  const data = (projects || []).map(project => ({
    id: project.id.toString(),
    created_at: project.created_at,
    updated_at: project.updated_at,
    name: project.name,
    description: project.description || null,
    customer_id: project.customer_id?.toString() || null,
    project_manager_id: project.project_manager_id?.toString() || null,
    start_date: project.start_date || null,
    end_date: project.end_date || null,
    status: project.status as 'cancelled' | 'completed' | 'planning' | 'in_progress' | null,
    priority: project.priority || 'medium' as const,
    budget: project.budget || null,
    actual_cost: project.actual_cost || 0,
    progress_percentage: project.progress_percentage || 0,
    notes: project.notes || null
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
