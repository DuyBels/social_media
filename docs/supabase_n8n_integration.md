# 🗄️ Tích hợp Supabase + n8n + Next.js cho Dashboard Đa Kênh

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để thiết lập **Supabase** làm cơ sở dữ liệu trung tâm, kết nối với **n8n** (làm backend xử lý và cập nhật dữ liệu) và đồng bộ lên giao diện **Next.js**.

---

## 🗺️ Luồng hoạt động dữ liệu (Data Flow)

1. **Thu thập dữ liệu nền (Mỗi 1h)**: n8n Cron Trigger $\rightarrow$ Gọi API Facebook/YouTube/Zalo/TikTok $\rightarrow$ Chuẩn hóa dữ liệu $\rightarrow$ Ghi vào **Supabase**.
2. **Yêu cầu xem số liệu (Frontend)**: Next.js $\rightarrow$ Yêu cầu `GET /analytics` tới **n8n Webhook** $\rightarrow$ n8n đọc dữ liệu từ **Supabase** $\rightarrow$ Trả kết quả JSON về Next.js.
3. **Đăng bài viết mới**: Next.js gửi nội dung bài đăng tới **n8n Webhook** $\rightarrow$ n8n đăng bài lên các kênh API của MXH $\rightarrow$ Ghi nhận lịch sử bài đăng vào **Supabase**.

---

## 1. Thiết lập Cấu trúc Cơ sở dữ liệu (Database Schema) trên Supabase

Truy cập trang quản trị dự án Supabase của bạn, mở **SQL Editor** và chạy đoạn lệnh sau để khởi tạo các bảng lưu trữ thông tin:

```sql
-- 1. Bảng lưu trữ chỉ số tương tác tổng hợp của từng nền tảng
CREATE TABLE public.platform_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(50) NOT NULL UNIQUE, -- 'Facebook', 'Instagram', 'TikTok', 'YouTube', 'Zalo'
    followers INT DEFAULT 0,
    reach INT DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0.00,
    views INT DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Bảng lưu trữ danh sách bài viết và trạng thái đăng tải
CREATE TABLE public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'video'
    platforms TEXT[] NOT NULL, -- Mảng lưu trữ các kênh muốn đăng, ví dụ: {'Facebook', 'TikTok'}
    status VARCHAR(20) DEFAULT 'scheduled', -- 'draft', 'scheduled', 'posted', 'failed'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    campaign VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Bảng lưu nhật ký tương tác gần đây (Engagement Logs)
CREATE TABLE public.engagement_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- 'Like', 'Comment', 'Share'
    post_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chèn dữ liệu khởi tạo ban đầu cho các nền tảng
INSERT INTO public.platform_metrics (platform, followers, reach, engagement_rate, views) VALUES
('Facebook', 12500, 45000, 4.5, 0),
('Instagram', 8400, 32000, 6.2, 0),
('TikTok', 25000, 120000, 11.5, 54000),
('YouTube', 3200, 15000, 8.4, 45000),
('Zalo', 1500, 5000, 3.1, 0)
ON CONFLICT (platform) DO NOTHING;
```

---

## 2. Kết nối n8n với Supabase

Vì Supabase chạy trên nền tảng cơ sở dữ liệu PostgreSQL, bạn có thể dễ dàng liên kết với n8n bằng thông số Postgres:

1. **Lấy thông tin kết nối từ Supabase**:
   - Truy cập **Project Settings** $\rightarrow$ **Database**.
   - Cuộn xuống phần **Connection Info** và lưu lại các thông tin:
     - `Host` (thường dạng `db.xxxx.supabase.co`)
     - `Database Name` (thường là `postgres`)
     - `Port` (`5432`)
     - `User` (`postgres`)
     - `Password` (Mật khẩu dự án của bạn).

2. **Cấu hình Credentials trên n8n**:
   - Trong giao diện n8n, chọn mục **Credentials** $\rightarrow$ **Add Credentials**.
   - Tìm kiếm **Postgres** (hoặc Supabase nếu phiên bản n8n có sẵn node).
   - Điền toàn bộ thông tin kết nối lấy từ bước trên vào. Kiểm tra kết nối thành công.

---

## 3. Thiết lập các Workflow trên n8n

Dưới đây là mô tả chi tiết cách xây dựng 2 luồng công việc cốt lõi trên n8n:

### Workflow A: Thu thập dữ liệu MXH tự động ghi vào Supabase (Chạy định kỳ)

```
[Cron Node / Schedule Trigger] 
              │
              ▼
   [HTTP Request Node / Social Node] ──► (Lấy dữ liệu từ Facebook/YouTube API)
              │
              ▼
    [Supabase/Postgres Node] ────────► (Chạy lệnh SQL UPDATE trên bảng 'platform_metrics')
```

- **Cron Node**: Thiết lập chạy mỗi 1 tiếng (`0 * * * *`).
- **HTTP Request**: Gọi tới Endpoint của Facebook Graph API:
  `GET https://graph.facebook.com/v18.0/me?fields=fan_count,impressions&access_token=YOUR_PAGE_TOKEN`
- **Postgres Node (Update)**: Cấu hình cập nhật số liệu:
  - **Operation**: `Update`
  - **Table**: `platform_metrics`
  - **Data**: Cập nhật cột `followers` và `reach` tương ứng cho bản ghi có `platform = 'Facebook'`.

---

### Workflow B: API Webhook cho Next.js lấy dữ liệu (Theo yêu cầu)

```
[n8n Webhook Node (GET /v1/analytics)] 
              │
              ▼
    [Supabase/Postgres Node] ────────► (SELECT * FROM platform_metrics)
              │
              ▼
  [Respond to Webhook Node] ─────────► (Trả về JSON thành công kèm mảng dữ liệu)
```

- **Webhook Node**:
  - **Method**: `GET`
  - **Path**: `v1/analytics`
  - **CORS Options**: Bật và cho phép Origin từ Next.js.
- **Postgres Node (Select)**:
  - **Operation**: `Execute Query`
  - **Query**: `SELECT platform, followers, reach, engagement_rate, views FROM platform_metrics;`
- **Respond to Webhook Node**:
  - **Response Body**:
    ```json
    {
      "success": true,
      "data": "{{$json.all()}}"
    }
    ```

---

## 4. Tích hợp dữ liệu vào Next.js (DashboardHome & DashboardSection)

Bây giờ bạn có thể thay đổi giao diện Next.js để tải dữ liệu thật thông qua API Client của n8n.

### Sửa đổi `src/components/sections/DashboardSection.tsx`

```typescript
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
// ... (giữ nguyên các import components)

type PlatformMetric = {
  platform: string;
  followers: number;
  reach: number;
  engagement_rate: number;
  views: number;
};

export function DashboardSection() {
  const [metrics, setMetrics] = useState<PlatformMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      // Gọi đến Webhook của n8n
      const res = await apiFetch<PlatformMetric[]>("v1/analytics");
      if (res.success && res.data) {
        setMetrics(res.data);
      } else {
        // Fallback sang dữ liệu cục bộ mặc định nếu n8n chưa phản hồi
        setMetrics([
          { platform: "Facebook", followers: 12500, reach: 45000, engagement_rate: 4.5, views: 0 },
          { platform: "Instagram", followers: 8400, reach: 32000, engagement_rate: 6.2, views: 0 },
          { platform: "TikTok", followers: 25000, reach: 120000, engagement_rate: 11.5, views: 54000 },
          { platform: "YouTube", followers: 3200, reach: 15000, engagement_rate: 8.4, views: 45000 },
        ]);
      }
      setLoading(false);
    }
    loadMetrics();
  }, []);

  if (loading) return <div>Đang tải dữ liệu tổng quan đa kênh...</div>;

  // Sử dụng biến `metrics` đã tải để vẽ biểu đồ và hiển thị thẻ chỉ số!
}
```

---

## 🔒 Khuyến nghị bảo mật và tối ưu hóa
1. **Dùng Supabase API Key an toàn**: Không bao giờ để lộ `SUPABASE_SERVICE_ROLE_KEY` (khóa admin) trên Next.js Frontend. Chỉ được sử dụng các khóa này trong workflow nội bộ của n8n.
2. **Sử dụng Supabase Edge Functions**: Nếu bạn muốn triển khai trực tiếp một số API logic siêu nhẹ mà không cần n8n, bạn có thể viết các Edge Function bằng TypeScript chạy trực tiếp trên Supabase.
3. **Cơ chế Hàng đợi (Queue)**: Khi phát triển chức năng đăng bài lên nhiều mạng xã hội cùng lúc, n8n nên đưa bài viết vào hàng đợi (Sử dụng thêm các bảng phụ hoặc hàng đợi tin nhắn) để tránh trường hợp mạng lỗi làm một kênh bị thất bại dẫn đến toàn bộ quy trình bị treo.
