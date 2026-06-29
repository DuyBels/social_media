"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiFetch } from "@/lib/apiClient";

type Engagement = {
  id: number;
  type: "Like" | "Comment" | "Share" | "Subscribe";
  user: string;
  platform: "YouTube" | "Zalo" | "TikTok" | "Facebook";
  post: string;
  time: string;
};

export function EngagementSection() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEngagements = async () => {
    setIsLoading(true);
    const result = await apiFetch<Engagement[]>("engagements");
    if (result.success && result.data) {
      setEngagements(result.data);
    } else {
      setEngagements([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEngagements();

    // Tự động quét cập nhật mới từ Zalo/YouTube sau mỗi 30 giây (quét ngầm không hiện loading để tránh giật UI)
    const interval = setInterval(() => {
      apiFetch<Engagement[]>("engagements").then((result) => {
        if (result.success && result.data) {
          setEngagements(result.data);
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);
  const getEngagementType = (type: string) => {
    const types: Record<string, string> = {
      Like: "Lượt thích",
      Comment: "Bình luận",
      Share: "Chia sẻ",
      Subscribe: "Đăng ký kênh",
    };
    return types[type] || type;
  };

  const getActionText = (type: string) => {
    const actions: Record<string, string> = {
      Like: "đã thích",
      Comment: "đã bình luận",
      Share: "đã chia sẻ",
      Subscribe: "đã đăng ký",
    };
    return actions[type] || `đã tương tác (${type})`;
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

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Tương tác gần đây</h2>
      {isLoading ? (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mr-2 align-middle" />
          Đang tải tương tác thực tế từ các kênh đã kết nối...
        </div>
      ) : engagements.length > 0 ? (
        <div className="grid gap-4">
          {engagements.map((e) => (
            <Card key={e.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="py-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{getPlatformColor(e.platform) === "#000000" ? "🔥" : "✨"}</span>
                    <span className="text-sm">{getPlatformColor(e.platform) === "#FF0000" && e.type === "Subscribe" ? "🎉 " : ""}{getEngagementType(e.type)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-[10px] px-2.5 py-0.5 rounded-full font-bold text-white" 
                      style={{ backgroundColor: getPlatformColor(e.platform) }}
                    >
                      {e.platform}
                    </span>
                    <span className="text-xs text-muted-foreground">{new Date(e.time).toLocaleString()}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="text-sm">
                  <span className="font-semibold text-foreground">{e.user}</span> {getActionText(e.type)}{" "}
                  {e.type === "Subscribe" ? (
                    <span className="font-medium text-red-600 dark:text-red-400">{e.post}</span>
                  ) : (
                    <>
                      bài đăng: <span className="italic text-muted-foreground">&quot;{e.post}&quot;</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground border rounded-lg bg-white/40 dark:bg-gray-800/40 border-dashed border-gray-300 dark:border-gray-700">
          Chưa có tương tác thực tế nào từ các kênh mạng xã hội đã tích hợp.
        </div>
      )}
    </div>
  );
}
