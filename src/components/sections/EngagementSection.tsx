"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const engagementDemo = [
  { id: 1, type: "Like", user: "Alice", post: "Ra mắt sản phẩm mới vào tuần tới! 🚀", time: "2025-06-11T09:00:00Z" },
  { id: 2, type: "Comment", user: "Bob", post: "Cảm ơn vì 10k người theo dõi! 🎉", time: "2025-06-10T15:00:00Z" },
  { id: 3, type: "Share", user: "Charlie", post: "Ra mắt sản phẩm mới vào tuần tới! 🚀", time: "2025-06-10T16:00:00Z" },
  { id: 4, type: "Like", user: "Dana", post: "Máy chủ của chúng tôi sẽ tạm dừng để bảo trì vào tối nay.", time: "2025-06-09T23:00:00Z" },
];

export function EngagementSection() {
  const getEngagementType = (type: string) => {
    const types: Record<string, string> = {
      Like: "Thích",
      Comment: "Bình luận",
      Share: "Chia sẻ",
    };
    return types[type] || type;
  };

  const getActionText = (type: string) => {
    const actions: Record<string, string> = {
      Like: "đã thích bài viết",
      Comment: "đã bình luận bài viết",
      Share: "đã chia sẻ bài viết",
    };
    return actions[type] || `đã tương tác (${type}) bài viết`;
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Tương tác gần đây</h2>
      <div className="grid gap-4">
        {engagementDemo.map((e) => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getEngagementType(e.type)}</span>
                <span className="text-xs text-muted-foreground">{new Date(e.time).toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <span className="font-semibold">{e.user}</span> {getActionText(e.type)}: <span className="italic">&quot;{e.post}&quot;</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
