"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { TrendingUp, Users, Eye, MessageCircle, Heart, DollarSign, Target } from "lucide-react";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const platformPostsData = {
  labels: ["YouTube", "Zalo", "TikTok", "Facebook"],
  datasets: [
    {
      label: "Bài viết tuần này",
      data: [25, 8, 12, 15],
      backgroundColor: ["#FF0000", "#0068FF", "#000000", "#1877f2"],
    },
  ],
};

const engagementData = {
  labels: ["Lượt thích", "Bình luận", "Chia sẻ", "Lượt lưu"],
  datasets: [
    {
      label: "Tổng lượt tương tác",
      data: [15420, 3280, 1950, 870],
      backgroundColor: ["#ef4444", "#f59e42", "#10b981", "#6366f1"],
    },
  ],
};

const weeklyTrendsData = {
  labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
  datasets: [
    {
      label: "Tăng trưởng người theo dõi",
      data: [1250, 1890, 2340, 2890],
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.1)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Lượt hiển thị (nghìn)",
      data: [245, 289, 334, 398],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.1)",
      tension: 0.4,
      fill: true,
    },
  ],
};

const platformMetrics = [
  { platform: "YouTube", status: "Đã đăng nhập", followers: "2 subscribers", engagement: "50.0%", reach: "24 views", color: "#FF0000" },
  { platform: "Zalo", status: "Đang tích hợp", followers: "3.2K quan tâm", engagement: "3.5%", reach: "12K", color: "#0068FF" },
  { platform: "TikTok", status: "Chưa kết nối", followers: "0", engagement: "0%", reach: "0", color: "#000000" },
  { platform: "Facebook", status: "Chưa kết nối", followers: "0", engagement: "0%", reach: "0", color: "#1877f2" },
];

export function DashboardSection() {
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người theo dõi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">305.2K</div>
            <p className="text-xs text-muted-foreground">+12.3% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt tiếp cận</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">544K</div>
            <p className="text-xs text-muted-foreground">+8.7% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ tương tác</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8%</div>
            <p className="text-xs text-muted-foreground">+0.3% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ suất hoàn vốn (ROI)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2x</div>
            <p className="text-xs text-muted-foreground">+0.4x so với tháng trước</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Bài viết theo nền tảng</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <Bar data={platformPostsData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Phân bổ tương tác</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <Doughnut data={engagementData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
                  }
                }
              }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Xu hướng tăng trưởng</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-48">
              <Line data={weeklyTrendsData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: 'bottom',
                    labels: { boxWidth: 12, padding: 8, font: { size: 11 } }
                  }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                  x: { grid: { display: false } }
                }
              }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Tổng quan hiệu suất nền tảng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformMetrics.map((platform) => (
              <div key={platform.platform} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="font-semibold">{platform.platform}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    platform.status === "Đã đăng nhập" 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : platform.status === "Đang tích hợp"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {platform.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Người theo dõi:</span>
                    <span className="font-medium">{platform.followers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tương tác:</span>
                    <span className="font-medium">{platform.engagement}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tiếp cận:</span>
                    <span className="font-medium">{platform.reach}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bài viết hiệu quả nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { platform: "TikTok", content: "Video hậu trường thiết kế 💡", engagement: "5.7K", color: "#000000" },
                { platform: "YouTube", content: "Video hướng dẫn sử dụng sản phẩm mới 🎥", engagement: "4.2K", color: "#FF0000" },
                { platform: "Facebook", content: "Chương trình khuyến mãi hè 2026 🌞", engagement: "1.8K", color: "#1877f2" },
                { platform: "Zalo", content: "Thông báo chương trình tri ân khách hàng 💝", engagement: "892", color: "#0068FF" },
              ].map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: post.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{post.content}</p>
                      <p className="text-xs text-muted-foreground">{post.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <Heart className="h-3 w-3 fill-current" />
                    {post.engagement}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <MessageCircle className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Tạo bài viết</span>
              </button>
              <button className="p-4 border rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Target className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Chiến dịch mới</span>
              </button>
              <button className="p-4 border rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Xem phân tích</span>
              </button>
              <button className="p-4 border rounded-lg text-center hover:bg-accent hover:text-accent-foreground transition-colors">
                <Users className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Quản lý thành viên</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
