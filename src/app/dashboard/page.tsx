import { ChartAreaInteractive } from "@/components/layout/dashboard/chart-area-interactive"
import { DataTable } from "@/components/layout/dashboard/data-table"
import { SectionCards } from "@/components/layout/dashboard/section-cards"
import { Button } from "@/components/ui/button"
import { 
  IconDownload, 
  IconRefresh, 
  IconFilter,
  IconCalendar
} from "@tabler/icons-react"

import data from "@/data/data.json"

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        {/* Header Section */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between px-4 py-6 lg:px-6">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-bold tracking-tight">Tổng quan</h2>
              <p className="text-muted-foreground">
                Theo dõi hiệu suất kinh doanh và các chỉ số quan trọng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <IconCalendar className="size-4" />
                <span className="hidden sm:inline ml-2">Khoảng thời gian</span>
              </Button>
              <Button variant="outline" size="sm">
                <IconFilter className="size-4" />
                <span className="hidden sm:inline ml-2">Bộ lọc</span>
              </Button>
              <Button variant="outline" size="sm">
                <IconRefresh className="size-4" />
                <span className="hidden sm:inline ml-2">Làm mới</span>
              </Button>
              <Button variant="outline" size="sm">
                <IconDownload className="size-4" />
                <span className="hidden sm:inline ml-2">Xuất báo cáo</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
          {/* Statistics Cards */}
          <SectionCards />
          
          {/* Chart Section */}
          <div className="grid gap-6">
            <ChartAreaInteractive />
          </div>
          
          {/* Data Table */}
          <div className="grid gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">Báo cáo chi tiết</h3>
                <p className="text-sm text-muted-foreground">
                  Dữ liệu và số liệu chi tiết về hoạt động kinh doanh
                </p>
              </div>
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  )
}
