# 🔌 Hướng dẫn tích hợp n8n làm Backend cho Dashboard

Tài liệu này hướng dẫn cách kết nối giao diện Next.js của Dashboard với **n8n** (một công cụ tự động hóa quy trình mạnh mẽ) để đóng vai trò làm backend xử lý logic, quản lý cơ sở dữ liệu và tương tác với API của các mạng xã hội.

---

## 🗺️ Kiến trúc hệ thống (Architecture)

n8n sẽ đóng vai trò như một API Gateway và Logic Backend. Các yêu cầu từ Next.js sẽ được gửi tới các endpoint Webhook của n8n.

```mermaid
graph TD
    A[Next.js Frontend] -->|HTTP Request| B(n8n Webhook Trigger)
    B --> C{Xử lý Logic}
    C -->|Lưu/Đọc dữ liệu| D[(Cơ sở dữ liệu - PostgreSQL/Supabase/Airtable)]
    C -->|Đẩy bài viết/Đọc số liệu| E[API Mạng xã hội - Facebook/Insta/Twitter/etc.]
    C -->|Phản hồi JSON| F(Respond to Webhook Node)
    F -->|HTTP Response| A
```

---

## 1. Thiết lập Workflow trên n8n

Mỗi endpoint API của dự án (ví dụ: `GET /posts`, `POST /posts`, `GET /customers`) sẽ tương ứng với một workflow trên n8n.

### Bước 1: Tạo Webhook Node (Trigger)
1. Thêm node **Webhook** vào workflow mới của bạn.
2. Cấu hình các thông số sau:
   - **Method**: Chọn phương thức phù hợp (`GET`, `POST`, `PATCH`, `DELETE`).
   - **Path**: Đặt đường dẫn tương ứng với API (Ví dụ: `posts` hoặc `customers`).
   - **Authentication**: 
     - Chọn `None` nếu muốn tự xử lý JWT token trong workflow.
     - Chọn `Header Auth` nếu muốn kiểm tra API Key trực tiếp tại node Webhook.
   - **CORS (Cross-Origin Resource Sharing)**: *Rất quan trọng để frontend gọi được API từ tên miền khác*. Bật cấu hình CORS trong phần Options của node Webhook và điền:
     - `Allowed Origins`: `*` hoặc địa chỉ frontend của bạn (ví dụ: `http://localhost:3000`).
     - `Allowed Headers`: `Content-Type, Authorization`.

### Bước 2: Xử lý dữ liệu (Database / Social Media API)
- **Truy vấn**: Sử dụng các node tương ứng như **PostgreSQL**, **Supabase**, **Airtable** hoặc các node mạng xã hội (**Facebook Graph API**, **Google Sheets**, v.v.) để lấy hoặc cập nhật dữ liệu dựa trên đầu vào từ Webhook (`query parameters` hoặc `body data`).

### Bước 3: Phản hồi kết quả (Respond to Webhook Node)
n8n cần trả về dữ liệu đúng định dạng JSON cho Next.js:
1. Thêm node **Respond to Webhook**.
2. Cấu hình:
   - **Respond With**: `Json`
   - **Response Body**: Định dạng dữ liệu theo cấu trúc chuẩn đã được định nghĩa trong api.md (ví dụ: `{ "success": true, "data": [...] }`).

> [!IMPORTANT]
> n8n có hai loại URL Webhook:
> - **Test Webhook URL**: Dùng khi bạn đang xây dựng/thử nghiệm (cần nhấn *Listen for test event* trong n8n).
> - **Production Webhook URL**: Dùng khi bạn kích hoạt (Active) workflow và chạy chính thức. Hãy chắc chắn sử dụng Production Webhook URL khi tích hợp thực tế.

---

## 2. Cấu hình Frontend Next.js

Để kết nối Next.js với n8n, chúng ta sẽ tạo một API Client dùng chung và cấu hình biến môi trường.

### Bước 1: Tạo tệp `.env.local`
Tạo tệp `.env.local` ở thư mục gốc của dự án (nếu chưa có) và trỏ Base URL đến n8n Webhook:

```env
# URL Webhook Production của n8n (bỏ phần path cuối, ví dụ /posts)
NEXT_PUBLIC_API_URL=https://your-n8n-instance.com/webhook
```

### Bước 2: Tạo API Client (`src/lib/apiClient.ts`)
Tạo một helper để gọi API dễ dàng, tự động gắn Token xác thực và xử lý lỗi:

```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/v1";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const token = localStorage.getItem("token"); // Lấy JWT token nếu có
    const headers = new Headers(options.headers);
    
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Lỗi hệ thống: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    return { success: false, error: error.message || "Đã xảy ra lỗi kết nối" };
  }
}
```

---

## 3. Thay thế dữ liệu giả lập (Demo Data) bằng API n8n

Dưới đây là ví dụ minh họa cách thay thế dữ liệu cứng (`demoUsers`) trong phần Quản lý người dùng (`UsersSection.tsx`) bằng dữ liệu động tải từ n8n.

### Cải tiến `UsersSection.tsx`

```typescript
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";
// ... (các import khác giữ nguyên)

type User = {
  id: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  email: string;
  status: "active" | "invited" | "suspended";
};

export function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tải danh sách người dùng từ n8n
  const fetchUsers = async () => {
    setLoading(true);
    // Gửi yêu cầu GET đến n8n Webhook /users
    const result = await apiFetch<User[]>("users");
    
    if (result.success && result.data) {
      setUsers(result.data);
      setError(null);
    } else {
      setError(result.error || "Không thể tải danh sách người dùng");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý thêm người dùng (Gửi yêu cầu POST tới n8n)
  const handleAdd = async (newUserData: Omit<User, "id">) => {
    const result = await apiFetch<User>("users", {
      method: "POST",
      body: JSON.stringify(newUserData),
    });

    if (result.success && result.data) {
      setUsers(prev => [...prev, result.data!]);
    } else {
      alert(result.error || "Thêm người dùng thất bại");
    }
  };

  if (loading) return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  if (error) return <div className="text-red-500 py-4">Lỗi: {error}</div>;

  return (
    // ... Phần JSX render giao diện giống như trước, sử dụng dữ liệu từ state `users`
  );
}
```

---

## 💡 Một số mẹo nhỏ & Kinh nghiệm tối ưu hóa
1. **Kiểm tra đầu vào (Validation)**: Ở n8n Webhook Node, bật tính năng `Always Respond` và thêm node **Switch** hoặc **If** để xác thực các tham số đầu vào. Tránh để workflow bị treo nếu Next.js truyền sai tham số.
2. **CORS trên Next.js (Dự phòng)**: Nếu n8n nằm sau một proxy chặn CORS và bạn không thể chỉnh cấu hình CORS trên n8n, hãy dùng tính năng **Rewrites** của Next.js trong `next.config.ts` để ủy quyền yêu cầu:
   ```typescript
   // next.config.ts
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     async rewrites() {
       return [
         {
           source: '/api/:path*',
           destination: 'https://your-n8n-instance.com/webhook/:path*',
         },
       ];
     },
   };
   export default nextConfig;
   ```
   Sau đó, trên Next.js chỉ cần gọi endpoint dạng `/api/users` thay vì địa chỉ tuyệt đối của n8n.
3. **Mã lỗi HTTP**: Hãy thiết lập node **Respond to Webhook** trả về mã HTTP thích hợp (ví dụ: `200 OK`, `201 Created` cho thêm mới, `400 Bad Request` cho lỗi đầu vào, hoặc `401 Unauthorized` cho sai thông tin đăng nhập).

---

## 5. Tích hợp TikTok & YouTube (Đăng song song 2 nền tảng)

Khi bạn nhấn nút "Đăng bài" từ Dashboard, dữ liệu gửi lên Webhook n8n (`POST /posts`) giờ đây sẽ bao gồm:
- **`content`**: Nội dung caption của bài viết.
- **`video`**: Tệp video nhị phân (binary).
- **`platforms`**: Chuỗi JSON chứa mảng các nền tảng muốn đăng (ví dụ: `["YouTube", "TikTok"]`).

Hãy cấu hình workflow n8n theo các bước sau để đăng bài tự động:

### Bước 5.1: Parse và xử lý Payload từ Webhook
Thêm một node **Code** (Javascript) ngay sau Webhook để giải mã danh sách nền tảng:
```javascript
const body = $input.item.json.body;
let platforms = [];

try {
  platforms = JSON.parse(body.platforms || '[]');
} catch (e) {
  // Dự phòng nếu đã là mảng hoặc định dạng khác
  platforms = typeof body.platforms === 'string' ? [body.platforms] : (body.platforms || []);
}

return {
  json: {
    content: body.content,
    platforms: platforms
  }
};
```

### Bước 5.2: Phân nhánh bằng Node Switch
1. Thêm một node **Switch** vào quy trình.
2. Cấu hình:
   - **Value 1**: `{{ $json.platforms }}`
   - **Type**: `String`
   - **Rules**:
     - Rule 1: Nếu chứa `YouTube` $\rightarrow$ Đi tới luồng YouTube (Node bạn đã cấu hình thành công).
     - Rule 2: Nếu chứa `TikTok` $\rightarrow$ Đi tới luồng TikTok.
     - Rule 3: Nếu chứa `Zalo` $\rightarrow$ Đi tới luồng Zalo.

---

### Bước 5.3: Hướng dẫn tích hợp TikTok API

Có 2 phương pháp chính để đăng video lên TikTok thông qua n8n:

#### 💡 Phương án A: Tích hợp qua Dịch vụ bên thứ ba (Được khuyến nghị cho dự án thử nghiệm)
Nếu bạn chưa có tài khoản Doanh nghiệp được kiểm duyệt (Audit) bởi TikTok, hãy sử dụng các nền tảng trung gian như **Ayrshare** hoặc **Buffer** để đơn giản hóa OAuth2 và đẩy thẳng bài viết:
1. Đăng ký tài khoản trên **Ayrshare** (có gói miễn phí) và kết nối tài khoản TikTok của bạn tại đó.
2. Trên n8n, kéo một node **HTTP Request**:
   - **Method**: `POST`
   - **URL**: `https://api.ayrshare.com/api/post`
   - **Headers**:
     - `Authorization`: `Bearer YOUR_AYRSHARE_API_KEY`
     - `Content-Type`: `application/json`
   - **Body (JSON)**:
     ```json
     {
       "post": "{{ $json.content }}",
       "platforms": ["tiktok"],
       "mediaUrls": ["{{ $binary.video.uploadUrl || 'URL_VIDEO_PUBLIC_NEU_CO' }}"]
     }
     ```

#### 🛡️ Phương án B: Tích hợp API TikTok Direct Post chính thức (Yêu cầu Audit)
Để sử dụng API trực tiếp từ TikTok Developer Portal:
1. Đăng ký tài khoản Developer trên [TikTok for Developers](https://developers.tiktok.com/).
2. Tạo App, kích hoạt Scope `video.publish` và thực hiện cấu hình OAuth2 trên n8n để lấy `Access Token`.
3. Trong n8n, thực hiện chuỗi 3 bước gọi API:

##### **Bước B.1: Khởi tạo tải lên (Init Upload)**
Thêm node **HTTP Request**:
- **Method**: `POST`
- **URL**: `https://open.tiktokapis.com/v2/post/publish/video/init/`
- **Headers**:
  - `Authorization`: `Bearer TIKTOK_ACCESS_TOKEN`
  - `Content-Type`: `application/json; charset=UTF-8`
- **Body (JSON)**:
  ```json
  {
    "post_info": {
      "title": "{{ $json.content }}",
      "privacy_level": "PUBLIC_TO_EVERYONE",
      "video_cover_timestamp_ms": 0
    },
    "source_info": {
      "source": "FILE_UPLOAD",
      "video_size": {{ $binary.video.fileSize }} 
    }
  }
  ```
- Kết quả nhận về sẽ có chứa `upload_url` và `publish_id`.

##### **Bước B.2: Đẩy file Video nhị phân (Upload Video)**
Thêm node **HTTP Request** tiếp theo:
- **Method**: `PUT`
- **URL**: `{{ $json.data.upload_url }}` (Lấy từ bước B.1)
- **Headers**:
  - `Content-Type`: `video/mp4`
  - `Content-Length`: `{{ $binary.video.fileSize }}`
- **Body**: Chọn gửi kiểu **Binary** và truyền thuộc tính `video` nhận được từ Webhook ban đầu.

##### **Bước B.3: Kiểm tra trạng thái xuất bản**
TikTok sẽ xử lý video không đồng bộ. Bạn có thể sử dụng endpoint để kiểm tra:
- **Method**: `POST`
- **URL**: `https://open.tiktokapis.com/v2/post/publish/status/`
- **Body**:
  ```json
  {
    "publish_id": "{{ $json.data.publish_id }}"
  }
  ```

---

### Bước 5.4: Hướng dẫn tích hợp Zalo Official Account (OA) API

Để xuất bản bài viết dạng video lên trang Zalo OA của doanh nghiệp thông qua n8n, bạn cần thực hiện các bước sau:

#### 🛡️ Chuẩn bị trên Zalo Developer Portal
1. Truy cập [Zalo for Developers](https://developers.zalo.me/) và đăng ký tài khoản.
2. Tạo một ứng dụng (App) liên kết với Zalo Official Account (OA) của bạn.
3. Trong phần cấu hình quyền ứng dụng (Permissions), kích hoạt quyền **quản lý bài viết** (ghi nội dung).
4. Thiết lập OAuth2 trên n8n (hoặc tạo cơ chế tự động lấy `access_token` mới từ `refresh_token` mỗi khi gọi API, vì access_token của Zalo có thời hạn ngắn là 25 tiếng).

#### 🔗 Quy trình gọi API trên n8n
Do API của Zalo yêu cầu tải video lên trước rồi mới tạo bài viết dựa trên ID của video đó, quy trình trên n8n sẽ bao gồm 3 bước HTTP Request kế tiếp:

##### **Bước C.1: Tải video lên hệ thống Zalo (Upload Video)**
Thêm node **HTTP Request**:
- **Method**: `POST`
- **URL**: `https://openapi.zalo.me/v2.0/article/upload_video/preparevideo`
- **Headers**:
  - `access_token`: `YOUR_ZALO_ACCESS_TOKEN`
- **Send Binary Data**: Bật tùy chọn gửi nhị phân (Binary).
- **Body Content Type**: `form-data` (Multipart)
- **Parameters**:
  - **Key**: `file`, **Value**: Truyền file video nhị phân nhận được từ Webhook (`video`).
- **Lưu ý**: Dung lượng tối đa là 50MB, định dạng `.mp4` hoặc `.avi`.
- Kết quả trả về chứa một `token` dùng để kiểm tra tiến trình xử lý video.

##### **Bước C.2: Xác thực và lấy Video ID (Verify Video)**
Vì Zalo cần thời gian xử lý/convert video đã tải lên, bạn cần gọi API xác thực trạng thái cho đến khi nhận được `video_id` thực tế:
- **Method**: `GET`
- **URL**: `https://openapi.zalo.me/v2.0/article/upload_video/verify`
- **Headers**:
  - `access_token`: `YOUR_ZALO_ACCESS_TOKEN`
- **Query Parameters**:
  - `token`: `{{ $json.token }}` (Nhận từ Bước C.1)
- *Mẹo nhỏ trên n8n*: Nếu video dung lượng lớn, bạn có thể thêm node **Wait** (chờ 5-10 giây) hoặc sử dụng tính năng Loop trên n8n để gọi lại kiểm tra cho đến khi trạng thái trả về là thành công và có `video_id`.

##### **Bước C.3: Tạo bài viết Video trên Zalo OA**
Sau khi có `video_id` từ Bước C.2, gửi yêu cầu HTTP tạo bài viết công khai trên Nhật ký của OA:
- **Method**: `POST`
- **URL**: `https://openapi.zalo.me/v2.0/article/create`
- **Headers**:
  - `access_token`: `YOUR_ZALO_ACCESS_TOKEN`
  - `Content-Type`: `application/json`
- **Body (JSON)**:
  ```json
  {
    "type": "video",
    "title": "Tiêu đề bài đăng video mới",
    "author": "Dashboard Admin",
    "video_id": "{{ $json.video_id }}",
    "description": "{{ $json.content }}", 
    "cover": {
      "cover_type": "photo",
      "photo_url": "URL_ANH_BIA_VIDEO_NEU_CO"
    },
    "status": "show"
  }
  ```
  *(Trường `description` sẽ chứa nội dung bài đăng truyền từ ô "Nội dung bài viết" của Dashboard)*

---

## 6. Thiết lập Workflow Nhận thông báo từ YouTube (YouTube Notification Workflow)

Để đồng bộ các thông báo mới từ YouTube về hệ thống Dashboard (hiển thị tại mục **Tương tác gần đây** và **Thanh thông báo**), chúng ta cần thiết lập một hệ thống kết hợp giữa **WebSub (Real-time Video Publish)** và **YouTube API Polling (Comments & Subscriptions)**.

```mermaid
graph TD
    A[YouTube Platform] -->|Video Mới Đăng - WebSub| B(n8n Webhook Node)
    A -->|Bình luận/Lượt đăng ký mới| C(n8n Cron Trigger)
    C -->|Gọi API| D(YouTube Data API Node)
    B -->|Bắt tay GET/Giải mã POST XML| E[n8n JS Code Node]
    D -->|Lọc bình luận mới| F[n8n Filter/Comparison Node]
    E -->|Lưu cơ sở dữ liệu| G[(Database - Supabase/Airtable)]
    F -->|Lưu tương tác| G
    G -->|API GET /notifications & /engagements| H[Next.js Dashboard]
```

### Bước 6.1: Nhận thông báo Video mới xuất bản qua WebSub (Real-time)

YouTube sử dụng giao thức WebSub (PubSubHubbub) để gửi thông báo đẩy (push notifications) mỗi khi kênh của bạn có video mới. 

#### 1. Đăng ký nhận thông báo với Hub của Google
Gửi một yêu cầu POST đến Hub của Google (`https://pubsubhubbub.appspot.com/subscribe`) với các tham số:
* `hub.callback`: Địa chỉ URL Webhook n8n của bạn (ví dụ: `https://n8n.yourdomain.com/webhook/youtube-notifications`).
* `hub.topic`: `https://www.youtube.com/xml/feeds/videos.xml?channel_id=YOUR_YOUTUBE_CHANNEL_ID`.
* `hub.mode`: `subscribe`.
* `hub.verify`: `async`.

#### 2. Cấu hình Node Webhook trên n8n
Node **Webhook** này cần xử lý cả hai hành động: xác thực đăng ký (GET) và tiếp nhận thông báo (POST).
* **Path**: `youtube-notifications`
* **Method**: `GET, POST` (hoặc tạo hai node Webhook có cùng path nhưng khác Method).
* **Respond With**: `Using Respond to Webhook Node` (hoặc `Automatic` cho POST).

#### 3. Xử lý logic bắt tay và phân tích dữ liệu (Node Code JS)
Kéo node **Code** (Javascript) vào sau Webhook:

```javascript
const method = $input.item.json.headers['x-forwarded-method'] || $input.item.json.query?.['hub.mode'] ? 'GET' : 'POST';

// Trường hợp 1: Xác thực đăng ký (GET Request từ Google Hub)
if ($input.item.json.query && $input.item.json.query['hub.challenge']) {
  return {
    json: {
      headers: {
        "content-type": "text/plain"
      },
      statusCode: 200,
      body: $input.item.json.query['hub.challenge']
    }
  };
}

// Trường hợp 2: Nhận thông báo Video mới (POST XML Payload)
// Lưu ý: n8n cần bật tính năng tự động parse XML hoặc dùng node XML để chuyển đổi
const body = $input.item.json.body;
if (body && body.feed && body.feed.entry) {
  const entry = body.feed.entry;
  const videoId = entry['yt:videoId'] || '';
  const channelId = entry['yt:channelId'] || '';
  const title = entry.title || 'Video mới';
  const videoUrl = entry.link?.$?.href || `https://www.youtube.com/watch?v=${videoId}`;
  
  return {
    json: {
      isNotification: true,
      type: "youtube_video",
      title: "Video mới đã xuất bản!",
      message: `Video "${title}" vừa được đăng tải công khai trên kênh YouTube.`,
      videoId: videoId,
      channelId: channelId,
      url: videoUrl,
      time: new Date().toISOString()
    }
  };
}

return { json: { status: "ignored" } };
```

#### 4. Trả về phản hồi cho Google Hub (Respond to Webhook)
* Nếu là yêu cầu GET xác thực: Kết nối đầu ra của Node Code ở trên vào node **Respond to Webhook**, cấu hình trả về **Response Body** là `{{ $json.body }}` với Content-Type `text/plain`.
* Nếu là yêu cầu POST chứa dữ liệu video: Lưu thông tin vào Database rồi trả về mã `204 No Content` hoặc `200 OK`.

---

### Bước 6.2: Quét bình luận và tương tác mới bằng Polling (Scheduled)

Do WebSub chỉ hỗ trợ thông báo khi đăng video mới, các bình luận (Comments) và lượt đăng ký mới (Subscribers) cần được quét định kỳ thông qua YouTube API.

#### 1. Thiết lập Node Schedule Trigger
* Cấu hình thời gian chạy tự động: **Mỗi 10 phút hoặc 15 phút** (`*/10 * * * *`).

#### 2. Kéo Node YouTube (hoặc HTTP Request)
* **Resource**: `Comment Thread`
* **Operation**: `Get Many` (Danh sách bình luận)
* **Parameters**:
  - `All for Channel`: Bật tùy chọn này để lấy bình luận trên toàn bộ kênh.
  - `Channel ID`: `YOUR_YOUTUBE_CHANNEL_ID`.
  - `Limit`: `20` (Đủ để lấy các bình luận mới phát sinh trong 10 phút qua).
  - `Authentication`: Sử dụng Credentials `YouTube OAuth2`.

#### 3. Node Filter & Comparison (Lọc bình luận mới)
Để tránh thông báo lặp lại các bình luận cũ đã xử lý:
1. Đọc danh sách bình luận đã lưu trong cơ sở dữ liệu (`GET engagements` hoặc `SELECT id FROM comments`).
2. Sử dụng node **Compare** hoặc node **Code JS** để lọc ra những bình luận có `commentId` chưa tồn tại trong database.

#### 4. Ghi nhận dữ liệu và đẩy thông báo
Với mỗi bình luận mới lọc được:
* **Lưu vào bảng Engagements**:
  ```json
  {
    "type": "Comment",
    "user": "{{ $json.snippet.topLevelComment.snippet.authorDisplayName }}",
    "platform": "YouTube",
    "post": "{{ $json.snippet.topLevelComment.snippet.textDisplay }}",
    "time": "{{ $json.snippet.topLevelComment.snippet.publishedAt }}"
  }
  ```
* **Lưu vào bảng Notifications**:
  ```json
  {
    "type": "youtube_comment",
    "title": "Bình luận mới trên YouTube",
    "message": "Người dùng {{ $json.snippet.topLevelComment.snippet.authorDisplayName }} đã bình luận: \"{{ $json.snippet.topLevelComment.snippet.textDisplay }}\"",
    "isRead": false,
    "createdAt": "{{ new Date().toISOString() }}"
  }
  ```

---

### Bước 6.3: Tích hợp API Endpoint trên n8n cho Frontend

Giao diện Next.js gọi hai endpoint Webhook sau của n8n để lấy danh sách tương tác và thông báo:

#### 1. Endpoint `/engagements` (GET)
* **Node Webhook**: Lắng nghe yêu cầu `GET /engagements`.
* **Node Database**: Truy vấn bảng `engagements` (sắp xếp theo thời gian mới nhất).
* **Node Respond to Webhook**: Trả về dữ liệu chuẩn JSON:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "type": "Comment",
        "user": "Nguyễn Văn A",
        "platform": "YouTube",
        "post": "Video hướng dẫn sử dụng sản phẩm mới 🎥",
        "time": "2026-06-30T04:20:00.000Z"
      }
      // ... các tương tác khác
    ]
  }
  ```

#### 2. Endpoint `/notifications` (GET)
* **Node Webhook**: Lắng nghe yêu cầu `GET /notifications`.
* **Node Database**: Truy vấn bảng `notifications` (lọc các thông báo chưa đọc hoặc giới hạn 10 tin mới nhất).
* **Node Respond to Webhook**: Trả về dữ liệu chuẩn JSON:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "notif_123",
        "message": "🔔 Có bình luận mới từ Nguyễn Văn A trên video YouTube: \"Tuyệt vời quá!\"",
        "type": "youtube_comment",
        "time": "5 phút trước"
      }
    ]
  }
  ```
