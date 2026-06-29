"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Calendar, Eye, Heart, MessageCircle, Share, BarChart3, Clock, X } from "lucide-react";
import { PublishPost } from "../PublishPost";

type Post = {
  id: string;
  content: string;
  platforms: ("Facebook" | "TikTok" | "YouTube" | "Zalo")[];
  scheduledAt: string;
  status: "scheduled" | "posted" | "failed" | "draft";
  mediaType: "text" | "image" | "video" | "carousel";
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  tags: string[];
  campaign?: string;
};

const demoPosts: Post[] = [
  {
    id: "1",
    content: "🚀 Tin vui! Bộ sưu tập mùa hè mới của chúng tôi sẽ ra mắt vào tuần tới. Hãy sẵn sàng cho những màu sắc rực rỡ và chất liệu bền vững sẽ làm mới tủ đồ của bạn! #ThoitrangMuahe #Benvung #Bousuutapmoi",
    platforms: ["Facebook"],
    scheduledAt: "2025-06-12T10:00:00Z",
    status: "scheduled",
    mediaType: "carousel",
    tags: ["muahe", "thoitrang", "benvung", "ramat"],
    campaign: "Ra mắt sản phẩm mùa hè",
  },
  {
    id: "2",
    content: "🎉 Tin tức cột mốc! Chúng tôi vừa đạt 10.000 người theo dõi tuyệt vời! Cảm ơn bạn đã đồng hành cùng chúng tôi trên hành trình đáng kinh ngạc này. Cùng hướng tới 10K tiếp theo nào! 💪 #Cotmoc #CamOn #Congdong",
    platforms: ["Facebook"],
    scheduledAt: "2025-06-10T14:00:00Z",
    status: "posted",
    mediaType: "image",
    engagement: {
      likes: 2847,
      comments: 156,
      shares: 89,
      views: 15420,
    },
    tags: ["cotmoc", "congdong", "camon"],
    campaign: "Nhận diện thương hiệu Q2",
  },
  {
    id: "3",
    content: "⚠️ Thông báo bảo trì: Máy chủ của chúng tôi sẽ tiến hành bảo trì định kỳ vào đêm nay từ 23:00 đến 03:00 sáng. Xin lỗi vì sự bất tiện này. #Baotri #Capnhatmaychu",
    platforms: ["Facebook"],
    scheduledAt: "2025-06-09T22:00:00Z",
    status: "failed",
    mediaType: "text",
    tags: ["baotri", "thongbao", "maychu"],
  },
  {
    id: "4",
    content: "💡 Hậu trường: Bạn đã bao giờ tự hỏi chúng tôi tạo ra sản phẩm như thế nào chưa? Hãy cùng ghé thăm studio thiết kế của chúng tôi, nơi sự đổi mới gặp gỡ tính sáng tạo! #Hautruong #Thietke #Sangsang",
    platforms: ["TikTok"],
    scheduledAt: "2025-06-13T16:00:00Z",
    status: "scheduled",
    mediaType: "video",
    tags: ["hautruong", "thietke", "sangsang"],
    campaign: "Tương tác với thế hệ Z",
  },
  {
    id: "5",
    content: "📊 Góc nhìn chuyên môn: Tương lai của tiếp thị mạng xã hội nằm ở những câu chuyện chân thực và xây dựng cộng đồng gắn kết. Ý kiến của bạn thế nào? #Meotiepthi #Chuyennganh #Mangxahoi",
    platforms: ["YouTube"],
    scheduledAt: "2025-06-11T09:00:00Z",
    status: "posted",
    mediaType: "text",
    engagement: {
      likes: 234,
      comments: 67,
      shares: 45,
      views: 3420,
    },
    tags: ["tiepthi", "chuyennganh", "gocnhin"],
    campaign: "Thu hút khách hàng B2B",
  },
  {
    id: "6",
    content: "🌟 Góc khách hàng: Gặp gỡ Sarah, người đã thay đổi phong cách của mình với các sản phẩm của chúng tôi! Hãy chia sẻ câu câu chuyện thay đổi của bạn trong phần bình luận nhé. #Khachhang #Thaydoi #Phongcach",
    platforms: ["Facebook", "Zalo"],
    scheduledAt: "2025-06-14T12:00:00Z",
    status: "draft",
    mediaType: "image",
    tags: ["khachhang", "noibat", "thaydoi"],
  },
  {
    id: "7",
    content: "🎥 Video hướng dẫn sử dụng sản phẩm mới của chúng tôi! Xem ngay để biết thêm chi tiết về các tính năng vượt trội. #Huongdan #Youtube #Video",
    platforms: ["YouTube", "Zalo"],
    scheduledAt: "2025-06-15T08:00:00Z",
    status: "posted",
    mediaType: "video",
    engagement: {
      likes: 4210,
      comments: 312,
      shares: 654,
      views: 89400,
    },
    tags: ["huongdan", "video", "youtube"],
  },
];

export function PostsSection() {
  const [posts] = useState<Post[]>(demoPosts);
  const [showPublishForm, setShowPublishForm] = useState(false);

  // Placeholder CRUD handlers
  const handleAdd = () => {
    setShowPublishForm(!showPublishForm);
  };
  const handleEdit = () => {};
  const handleDelete = () => {};

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      scheduled: "Đã lên lịch",
      posted: "Đã đăng",
      failed: "Thất bại",
      draft: "Bản nháp",
    };
    return texts[status] || status;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Facebook: "#1877f2",
      TikTok: "#000000",
      YouTube: "#FF0000",
      Zalo: "#0068FF",
    };
    return colors[platform] || "#6366f1";
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case "video": return "🎥";
      case "image": return "📷";
      case "carousel": return "🖼️";
      default: return "📝";
    }
  };

  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(p => p.status === "scheduled").length;
  const postedPosts = posts.filter(p => p.status === "posted").length;
  const draftPosts = posts.filter(p => p.status === "draft").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Quản lý nội dung</h2>
        <Button onClick={handleAdd} variant={showPublishForm ? "outline" : "default"} className="w-full sm:w-auto">
          {showPublishForm ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Đóng form
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Tạo bài viết
            </>
          )}
        </Button>
      </div>

      {showPublishForm && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <PublishPost />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số bài viết</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">Tất cả các nội dung</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lên lịch</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledPosts}</div>
            <p className="text-xs text-muted-foreground">Sẵn sàng xuất bản</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã đăng</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postedPosts}</div>
            <p className="text-xs text-muted-foreground">Nội dung hiển thị</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bản nháp</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-xs text-muted-foreground">Đang chuẩn bị</p>
          </CardContent>
        </Card>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getMediaTypeIcon(post.mediaType)}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{new Date(post.scheduledAt).toLocaleString()}</span>
                    </div>
                    {post.campaign && (
                      <p className="text-xs text-muted-foreground">Chiến dịch: {post.campaign}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      post.status === "scheduled"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : post.status === "posted"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : post.status === "failed"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {getStatusText(post.status)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Content Preview */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm line-clamp-3">{post.content}</p>
              </div>

              {/* Platforms & Tags */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-2">Nền tảng</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="text-xs px-2 py-1 rounded-full text-white font-medium"
                        style={{ backgroundColor: getPlatformColor(platform) }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-2">Thẻ</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engagement Stats (for posted content) */}
              {post.engagement && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Hiệu suất</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{post.engagement.likes.toLocaleString()}</span>
                      <span className="text-muted-foreground">lượt thích</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{post.engagement.comments.toLocaleString()}</span>
                      <span className="text-muted-foreground">bình luận</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Share className="h-4 w-4 text-green-500" />
                      <span className="font-medium">{post.engagement.shares.toLocaleString()}</span>
                      <span className="text-muted-foreground">chia sẻ</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">{post.engagement.views.toLocaleString()}</span>
                      <span className="text-muted-foreground">lượt xem</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Sửa
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
