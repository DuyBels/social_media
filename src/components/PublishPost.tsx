"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, FileText, Send, AlertCircle, CheckCircle2 } from "lucide-react";

// Biểu tượng YouTube tự chế bằng SVG để hiển thị đẹp mắt và chuẩn xác
const YoutubeIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.516 0-9.387.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.507 9.387.507 9.387.507s7.517 0 9.387-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Biểu tượng TikTok tự chế bằng SVG thiết kế chuẩn theo bộ nhận diện thương hiệu
const TiktokIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.85.99 2 1.69 3.29 1.97v3.91c-1.39-.03-2.77-.38-4-1.02-.32-.17-.63-.37-.92-.59v6.52c-.05 1.56-.51 3.12-1.37 4.41-1.32 1.95-3.52 3.19-5.91 3.18-2.61.03-5.08-1.25-6.52-3.43-1.42-2.13-1.68-4.9-0.69-7.25.92-2.22 2.99-3.79 5.37-4.13.06-.01.12-.02.19-.02.01 1.34 0 2.67.01 4.01-.84.09-1.65.51-2.2 1.16-.62.74-.89 1.72-.73 2.68.18 1.05.85 1.98 1.8 2.37.95.4 2.05.28 2.89-.32.74-.53 1.18-1.38 1.2-2.28V0c.05.01.07.02.13.02z"/>
  </svg>
);

// Biểu tượng Zalo tự chế bằng SVG thiết kế chuẩn theo bộ nhận diện thương hiệu
const ZaloIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.58 1.34 4.88 3.42 6.26l-1.24 3.7c-.15.46.28.88.74.74l4.24-1.42c.89.27 1.85.42 2.84.42 5.52 0 10-3.82 10-8.5S17.52 2 12 2zm4 11.5c0 .28-.22.5-.5.5H10.1l4.2-5.6c.18-.24.01-.5-.28-.5H10.5c-.28 0-.5.22-.5.5v.5c0 .28.22.5.5.5h2.9l-4.2 5.6c-.18.24-.01.5.28.5h3.52c.28 0 .5-.22.5-.5v-.5z" />
  </svg>
);

// Biểu tượng Facebook tự chế bằng SVG thiết kế chuẩn theo bộ nhận diện thương hiệu
const FacebookIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function PublishPost() {
  // State quản lý nội dung bài viết và tệp video
  const [postContent, setPostContent] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);

  // State quản lý các kênh mạng xã hội muốn đăng tải (Mặc định chọn YouTube và Facebook)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["YouTube", "Facebook"]);

  // State quản lý trạng thái tải (loading) và phản hồi hệ thống
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Xử lý khi người dùng chọn/hủy chọn nền tảng
  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

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

    // 1. Kiểm tra điều kiện tiên quyết: Bắt buộc chọn ít nhất một nền tảng và chọn file video
    if (selectedPlatforms.length === 0) {
      alert("Vui lòng chọn ít nhất một nền tảng muốn đăng!");
      return;
    }
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
      formData.append("platforms", JSON.stringify(selectedPlatforms));

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

          {/* Chọn kênh mạng xã hội muốn đăng */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Send className="h-4 w-4 text-muted-foreground" />
              Chọn kênh đăng tải (Bắt buộc chọn ít nhất một kênh)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Facebook Option */}
              <button
                type="button"
                onClick={() => handlePlatformToggle("Facebook")}
                className={`flex items-center justify-between p-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedPlatforms.includes("Facebook")
                    ? "border-[#1877f2] bg-[#1877f2]/5 text-[#1877f2] shadow-sm"
                    : "border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FacebookIcon />
                  <span>Facebook</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  selectedPlatforms.includes("Facebook")
                    ? "border-[#1877f2] bg-[#1877f2]"
                    : "border-muted-foreground"
                }`}>
                  {selectedPlatforms.includes("Facebook") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>

              {/* YouTube Option */}
              <button
                type="button"
                onClick={() => handlePlatformToggle("YouTube")}
                className={`flex items-center justify-between p-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedPlatforms.includes("YouTube")
                    ? "border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000] shadow-sm"
                    : "border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <YoutubeIcon />
                  <span>YouTube</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  selectedPlatforms.includes("YouTube")
                    ? "border-[#FF0000] bg-[#FF0000]"
                    : "border-muted-foreground"
                }`}>
                  {selectedPlatforms.includes("YouTube") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>

              {/* TikTok Option */}
              <button
                type="button"
                onClick={() => handlePlatformToggle("TikTok")}
                className={`flex items-center justify-between p-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedPlatforms.includes("TikTok")
                    ? "border-foreground bg-foreground/5 text-foreground shadow-sm dark:border-white dark:bg-white/5 dark:text-white"
                    : "border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TiktokIcon />
                  <span>TikTok</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  selectedPlatforms.includes("TikTok")
                    ? "border-foreground bg-foreground dark:border-white dark:bg-white"
                    : "border-muted-foreground"
                }`}>
                  {selectedPlatforms.includes("TikTok") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                  )}
                </div>
              </button>

              {/* Zalo Option */}
              <button
                type="button"
                onClick={() => handlePlatformToggle("Zalo")}
                className={`flex items-center justify-between p-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  selectedPlatforms.includes("Zalo")
                    ? "border-[#0068FF] bg-[#0068FF]/5 text-[#0068FF] shadow-sm"
                    : "border-input bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ZaloIcon />
                  <span>Zalo</span>
                </div>
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  selectedPlatforms.includes("Zalo")
                    ? "border-[#0068FF] bg-[#0068FF]"
                    : "border-muted-foreground"
                }`}>
                  {selectedPlatforms.includes("Zalo") && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            </div>
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
