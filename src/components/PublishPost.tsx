"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export function PublishPost() {
  // State quản lý nội dung bài viết và tệp video
  const [postContent, setPostContent] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // State quản lý trạng thái tải (loading) và phản hồi hệ thống
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Xử lý sự kiện khi thay đổi nội dung văn bản
  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPostContent(e.target.value);
  };

  // Xử lý sự kiện khi người dùng chọn file video
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];

      // Kiểm tra xem tệp được chọn có phải là video hay không
      if (!selectedFile.type.startsWith("video/")) {
        alert("Vui lòng chọn một tệp video hợp lệ (ví dụ: .mp4, .mov, .avi)");
        e.target.value = ""; // Reset input file
        setVideoFile(null);
        return;
      }
      setVideoFile(selectedFile);
    }
  };

  // Hàm xử lý khi người dùng nhấn nút "Đăng bài"
  const handlePublish = async (e: FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // 1. Kiểm tra điều kiện tiên quyết: Bắt buộc chọn file video
    if (!videoFile) {
      alert("Vui lòng chọn tệp video trước khi đăng bài!");
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Sử dụng FormData để đóng gói dữ liệu truyền tải (multipart/form-data)
      const formData = new FormData();
      formData.append("content", postContent);
      formData.append("video", videoFile);

      // 3. Gửi request POST tới địa chỉ n8n Webhook
      // Lấy URL cơ sở từ biến môi trường (mặc định là localhost)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5678/webhook";
      
      // Đảm bảo đường dẫn chính xác (hỗ trợ cả chạy thử nghiệm /webhook-test)
      const url = baseUrl.endsWith("/") ? `${baseUrl}posts` : `${baseUrl}/posts`;

      // LƯU Ý QUAN TRỌNG: Không set header 'Content-Type' thủ công khi gửi FormData,
      // để trình duyệt tự động định nghĩa kèm theo ranh giới boundary phù hợp.
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      // 4. Xử lý phản hồi kết quả
      if (response.ok) {
        setStatusMessage({
          type: "success",
          text: "Bài viết và video của bạn đã được đăng thành công lên hệ thống n8n!",
        });
        // Reset form sau khi gửi thành công
        setPostContent("");
        setVideoFile(null);
        const fileInput = document.getElementById("video-upload") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        const errorText = await response.text();
        throw new Error(errorText || `Lỗi hệ thống: ${response.status}`);
      }
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      const errMsg = error instanceof Error ? error.message : "Không thể kết nối tới server n8n.";
      alert(`Đăng bài thất bại: ${errMsg}`);
      setStatusMessage({
        type: "error",
        text: `Có lỗi xảy ra: ${errMsg}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Send className="h-5 w-5 text-primary" />
          Đăng bài viết mới
        </CardTitle>
        <CardDescription>
          Đăng tải nội dung văn bản và đính kèm video trực tiếp lên các kênh MXH thông qua n8n.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePublish} className="space-y-5">
          {/* Nhập nội dung bài viết */}
          <div className="space-y-2">
            <label htmlFor="post-content" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Nội dung bài viết
            </label>
            <textarea
              id="post-content"
              rows={4}
              value={postContent}
              onChange={handleContentChange}
              placeholder="Viết nội dung bài đăng của bạn tại đây..."
              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Chọn tệp video */}
          <div className="space-y-2">
            <label htmlFor="video-upload" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Video className="h-4 w-4 text-muted-foreground" />
              Đính kèm Video (Bắt buộc)
            </label>
            <div className="flex flex-col gap-2">
              <input
                id="video-upload"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Hỗ trợ định dạng: .mp4, .mov, .avi, .mkv (dung lượng tối đa cấu hình trên n8n)
              </p>
            </div>
          </div>

          {/* Hiển thị thông báo trạng thái */}
          {statusMessage && (
            <div
              className={`p-3 rounded-md flex items-start gap-2.5 text-sm ${statusMessage.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"
                }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Nút bấm đăng bài */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-5 font-semibold transition-all"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Đang xử lý đăng bài...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Đăng bài viết
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
