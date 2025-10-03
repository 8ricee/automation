import { DataTable } from "@/components/table/data-table";
import { employeeColumns } from "@/features/employees/table/columns";
import { employees } from "@/data/data";
import { CreateRecordButton } from "@/components/table/create-record-button";

export default async function EmployeesPage() {
  const data = employees;

  return (
    <div className="h-full flex-1 flex-col gap-8 p-8 md:flex">
      <DataTable
        data={data}
        columns={employeeColumns}
        toolbarConfig={{
          placeholder: "Tìm nhân sự...",
          searchColumn: "name",
          facetedFilters: [
            { column: "department", title: "Phòng ban", options: Array.from(new Set(data.map((x) => x.department).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) })) },
            { column: "status", title: "Trạng thái", options: Array.from(new Set(data.map((x) => x.status).filter(Boolean))).map((v) => ({ label: String(v), value: String(v) })) },
          ],
          actionsRender: (
            <CreateRecordButton
              title="Thêm nhân sự"
              fields={[
                { name: "name", label: "Họ tên" },
                { name: "email", label: "Email", type: "email" },
                { name: "department", label: "Phòng ban" },
                { name: "title", label: "Chức danh" },
              ]}
            />
          ),
        }}
      />
    </div>
  );
}
