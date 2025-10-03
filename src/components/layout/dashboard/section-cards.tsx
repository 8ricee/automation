import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card hover:shadow-md transition-shadow">
        <CardHeader>
          <CardDescription>Tổng doanh thu</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,250 triệu VNĐ
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tăng trưởng so với tháng trước <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Doanh thu 6 tháng gần nhất
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card hover:shadow-md transition-shadow">
        <CardHeader>
          <CardDescription>Khách hàng mới</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-red-600 border-red-600">
              <IconTrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Giảm 20% trong kỳ này <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Cần chú ý đến chiến lược thu hút khách hàng
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card hover:shadow-md transition-shadow">
        <CardHeader>
          <CardDescription>Dự án đang hoạt động</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            15
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tăng trưởng tích cực <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Hiệu suất vượt mục tiêu đề ra</div>
        </CardFooter>
      </Card>
      <Card className="@container/card hover:shadow-md transition-shadow">
        <CardHeader>
          <CardDescription>Tỷ lệ chuyển đổi</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Tăng trưởng đều đặn <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Đạt đúng kỳ vọng phát triển</div>
        </CardFooter>
      </Card>
    </div>
  )
}
