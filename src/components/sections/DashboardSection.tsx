"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { TrendingUp, Users, Eye, MessageCircle, Heart, DollarSign, Target } from "lucide-react";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/apiClient";

interface EngagementItem {
  id: number;
  type: string;
  user: string;
  platform: string;
  post: string;
  time: string;
}

export function DashboardSection() {
  const [stats, setStats] = useState({
    followers: 2,
    reach: 24,
    engagement: 50.0,
    postsThisWeek: 1,
    commentsCount: 3,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const res = await apiFetch<EngagementItem[]>("engagements");
      if (res.success && res.data) {
        const engagements = res.data;
        
        // Find latest YouTube subscriber milestone
        const youtubeSubsItem = engagements.find(
          (e) => e.platform === "YouTube" && e.type === "Subscribe"
        );
        let followers = 2; // default
        if (youtubeSubsItem) {
          const match = youtubeSubsItem.post.match(/(\d+)/);
          if (match) {
            followers = parseInt(match[1], 10);
          }
        }

        // Find latest YouTube views milestone (separate View event)
        const youtubeViewsItem = engagements.find(
          (e) => e.platform === "YouTube" && e.type === "View"
        );
        let reach = 6; // default
        if (youtubeViewsItem) {
          const match = youtubeViewsItem.post.match(/(\d+)/);
          if (match) {
            reach = parseInt(match[1], 10);
          }
        }

        // Count YouTube comments
        const ytComments = engagements.filter(
          (e) => e.platform === "YouTube" && e.type === "Comment"
        );
        const commentsCount = ytComments.length;

        // Calculate engagement rate
        const engagement = reach > 0 ? parseFloat(((commentsCount / reach) * 100).toFixed(1)) : 0;
        
        // Count YouTube videos
        const ytVideos = engagements.filter(
          (e) => e.platform === "YouTube" && e.type === "Video"
        );
        const postsThisWeek = 1 + ytVideos.length;

        setStats({
          followers,
          reach,
          engagement: engagement > 0 ? engagement : 50.0,
          postsThisWeek,
          commentsCount,
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const platformPostsData = {
    labels: ["YouTube", "Zalo", "TikTok", "Facebook"],
    datasets: [
      {
        label: "Bài viết tuần này",
        data: [stats.postsThisWeek, 0, 0, 0],
        backgroundColor: ["#FF0000", "#0068FF", "#000000", "#1877f2"],
      },
    ],
  };

  const engagementData = {
    labels: ["Lượt thích", "Bình luận", "Chia sẻ", "Lượt lưu"],
    datasets: [
      {
        label: "Tổng lượt tương tác",
        data: [0, stats.commentsCount, 0, 0],
        backgroundColor: ["#ef4444", "#f59e42", "#10b981", "#6366f1"],
      },
    ],
  };

  const weeklyTrendsData = {
    labels: ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"],
    datasets: [
      {
        label: "Tăng trưởng người theo dõi",
        data: [0, 0, 0, stats.followers],
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Lượt hiển thị (lượt)",
        data: [0, 0, 0, stats.reach],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const platformMetrics = [
    { platform: "YouTube", status: "Đã đăng nhập", followers: `${stats.followers} subscribers`, engagement: `${stats.engagement.toFixed(1)}%`, reach: `${stats.reach} views`, color: "#FF0000" },
    { platform: "Zalo", status: "Chưa kết nối", followers: "0", engagement: "0%", reach: "0", color: "#0068FF" },
    { platform: "TikTok", status: "Chưa kết nối", followers: "0", engagement: "0%", reach: "0", color: "#000000" },
    { platform: "Facebook", status: "Chưa kết nối", followers: "0", engagement: "0%", reach: "0", color: "#1877f2" },
  ];

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
            <div className="text-2xl font-bold">{loading ? "..." : stats.followers.toLocaleString()}</div>
            <p className="text-xs text-green-600">+{stats.followers} người đăng ký</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng lượt tiếp cận</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.reach.toLocaleString()}</div>
            <p className="text-xs text-green-600">+{stats.reach} lượt xem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ lệ tương tác</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.engagement.toFixed(1)}%</div>
            <p className="text-xs text-green-600">Hiệu suất cao</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tỷ suất hoàn vốn (ROI)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0x</div>
            <p className="text-xs text-muted-foreground">Chưa có dữ liệu</p>
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
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-green-300"
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
            <div className="text-center py-8 text-sm text-muted-foreground">
              Chưa có bài viết nào
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
