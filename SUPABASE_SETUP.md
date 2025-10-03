# Supabase Integration Setup

## 🔧 Hướng dẫn thiết lập Supabase

### 1. Tạo Project Supabase

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng nhập và tạo project mới
3. Chọn organization và đặt tền project (ví dụ: "automation-amtsc")
4. Chọn region gần nhất (Singapore hoặc Tokyo)
5. Đặt password cho database

### 2. Lấy API Keys

1. Vào **Settings** > **API** trong project dashboard
2. Copy:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **Anon/Public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Cấu hình Environment Variables

1. Copy file `env.example` thành `.env.local`
2. Điền thông tin từ Bước 2:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Thiết lập Database Schema

1. Vào **SQL Editor** trong Supabase dashboard
2. Copy nội dung từ `supabase/schema.sql`
3. Paste và execute script để tạo tables và policies

### 5. Authentication Setup

1. Vào **Authentication** > **Settings**
2. Tuỳ chỉnh:
   - **Site URL**: `http://localhost:3000` (development)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/dashboard`
   - **Email Templates**: Tuỳ chọn thay đổi templates

### 6. Email Provider (Optional)

Để gửi email authentication:

1. Vào **Authentication** > **Providers**
2. Cấu hình **Email** provider:
   - Enable email confirmations
   - Set up SMTP (optional) hoặc sử dụng Supabase email service

### 7. Test Integration

Sau khi setup xong:

1. Chạy `npm run dev`
2. Truy cập `/auth/login`
3. Thử tạo tài khoản mới
4. Kiểm tra các trang được bảo vệ

## 📊 Database Schema

### Tables đã tạo:

- **customers**: Thông tin khách hàng
- **products**: Danh sách sản phẩm
- **orders**: Đơn hàng
- **order_items**: Chi tiết đơn hàng
- **employees**: Nhân viên
- **projects**: Dự án

### Row Level Security (RLS):

- Tất cả tables đều enabled RLS
- Chỉ authenticated users có thể truy cập
- Policies cho CRUD operations

## 🔄 Migration và Sync

### Để sync với production:

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login và link project
supabase login
supabase link --project-ref your-project-ref

# Push schema changes
supabase db push
```

### Generate TypeScript types:

```bash
supabase gen types typescript --project-id your-project-ref > src/lib/database.types.ts
```

## 🛠️ Troubleshooting

### Lỗi thường gặp:

1. **"Missing Supabase environment variables"**
   - Kiểm tra file `.env.local` có đúng format
   - Restart development server sau khi thay đổi env vars

2. **Authentication không hoạt động**
   - Kiểm tra Site URL và Redirect URLs trong Supabase dashboard
   - Verify middleware.ts config

3. **Database connection error**
   - Kiểm tra PROJECT_URL format
   - Verify API keys chính xác

## 📝 Notes

- Tất cả APIs được implement trong `src/lib/`
- Authentication flow qua middleware protection
- TypeScript types được auto-generated từ schema
- RLS policies bảo mật dữ liệu

## 🚀 Next Steps

1. Customize auth flow cho phù hợp business
2. Implement role-based access control
3. Add real-time subscriptions
4. Setup backup và monitoring
