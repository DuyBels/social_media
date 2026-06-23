"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MessageSquare, Mail, Phone, MapPin, Star, TrendingUp, Users, DollarSign } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  joinDate: string;
  lastActive: string;
  totalSpent: number;
  orders: number;
  platform: "Facebook" | "Instagram" | "Twitter" | "LinkedIn" | "TikTok" | "Website" | "Email";
  segment: "VIP" | "Regular" | "New" | "At Risk";
  satisfaction: number; // 1-5
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    messages: number;
  };
  campaigns: string[];
  notes: string;
};

const demoCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, Mỹ",
    avatar: "SJ",
    joinDate: "2024-03-15",
    lastActive: "2025-06-11T08:30:00Z",
    totalSpent: 2850,
    orders: 12,
    platform: "Instagram",
    segment: "VIP",
    satisfaction: 5,
    interactions: { likes: 45, comments: 12, shares: 8, messages: 3 },
    campaigns: ["Ra mắt sản phẩm mùa hè", "Nhận diện thương hiệu Q2"],
    notes: "Khách hàng tương tác rất cao, thường xuyên mua các sản phẩm cao cấp",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@techcorp.com",
    phone: "+1 (555) 987-6543",
    location: "San Francisco, Mỹ",
    avatar: "MC",
    joinDate: "2024-01-22",
    lastActive: "2025-06-10T16:45:00Z",
    totalSpent: 5200,
    orders: 8,
    platform: "LinkedIn",
    segment: "VIP",
    satisfaction: 4,
    interactions: { likes: 23, comments: 18, shares: 15, messages: 7 },
    campaigns: ["Thu hút khách hàng B2B", "Khuyến mãi ngày lễ"],
    notes: "Khách hàng doanh nghiệp, quan tâm đến đơn hàng số lượng lớn và giải pháp doanh nghiệp",
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    email: "emma.r@gmail.com",
    phone: "+1 (555) 456-7890",
    location: "Miami, Mỹ",
    avatar: "ER",
    joinDate: "2025-05-01",
    lastActive: "2025-06-11T12:15:00Z",
    totalSpent: 320,
    orders: 3,
    platform: "TikTok",
    segment: "New",
    satisfaction: 4,
    interactions: { likes: 67, comments: 34, shares: 23, messages: 2 },
    campaigns: ["Tương tác với thế hệ Z"],
    notes: "Khách hàng trẻ tuổi, hoạt động rất tích cực trên mạng xã hội, nhạy cảm về giá",
  },
  {
    id: "4",
    name: "David Thompson",
    email: "david.t@email.com",
    phone: "+1 (555) 234-5678",
    location: "Chicago, Mỹ",
    avatar: "DT",
    joinDate: "2023-11-10",
    lastActive: "2025-05-20T10:20:00Z",
    totalSpent: 1200,
    orders: 15,
    platform: "Facebook",
    segment: "At Risk",
    satisfaction: 3,
    interactions: { likes: 12, comments: 3, shares: 1, messages: 0 },
    campaigns: ["Khuyến mãi ngày lễ"],
    notes: "Khách hàng từng hoạt động tích cực, mức độ tương tác giảm gần đây",
  },
  {
    id: "5",
    name: "Lisa Wang",
    email: "lisa.wang@startup.io",
    phone: "+1 (555) 345-6789",
    location: "Seattle, Mỹ",
    avatar: "LW",
    joinDate: "2024-08-03",
    lastActive: "2025-06-11T09:00:00Z",
    totalSpent: 890,
    orders: 6,
    platform: "Twitter",
    segment: "Regular",
    satisfaction: 4,
    interactions: { likes: 28, comments: 9, shares: 12, messages: 4 },
    campaigns: ["Nhận diện thương hiệu Q2", "Ra mắt sản phẩm mùa hè"],
    notes: "Chuyên gia ngành công nghệ, đề cao tính đổi mới và chất lượng",
  },
  {
    id: "6",
    name: "James Mitchell",
    email: "james.m@email.com",
    phone: "+1 (555) 567-8901",
    location: "Austin, Mỹ",
    avatar: "JM",
    joinDate: "2024-12-15",
    lastActive: "2025-06-11T14:30:00Z",
    totalSpent: 450,
    orders: 4,
    platform: "Website",
    segment: "Regular",
    satisfaction: 5,
    interactions: { likes: 15, comments: 5, shares: 3, messages: 1 },
    campaigns: ["Ra mắt sản phẩm mùa hè"],
    notes: "Khách hàng trực tiếp từ trang web, ưu tiên giao tiếp qua email",
  },
];

const segmentData = {
  labels: ["VIP", "Thường xuyên", "Mới", "Rủi ro rời bỏ"],
  datasets: [
    {
      label: "Phân khúc khách hàng",
      data: [
        demoCustomers.filter(c => c.segment === "VIP").length,
        demoCustomers.filter(c => c.segment === "Regular").length,
        demoCustomers.filter(c => c.segment === "New").length,
        demoCustomers.filter(c => c.segment === "At Risk").length,
      ],
      backgroundColor: ["#10b981", "#6366f1", "#f59e42", "#ef4444"],
    },
  ],
};

const platformData = {
  labels: ["Instagram", "LinkedIn", "TikTok", "Facebook", "Twitter", "Website"],
  datasets: [
    {
      label: "Khách hàng theo nền tảng",
      data: [
        demoCustomers.filter(c => c.platform === "Instagram").length,
        demoCustomers.filter(c => c.platform === "LinkedIn").length,
        demoCustomers.filter(c => c.platform === "TikTok").length,
        demoCustomers.filter(c => c.platform === "Facebook").length,
        demoCustomers.filter(c => c.platform === "Twitter").length,
        demoCustomers.filter(c => c.platform === "Website").length,
      ],
      backgroundColor: "#6366f1",
    },
  ],
};

export function CustomersSection() {
  const [customers] = useState<Customer[]>(demoCustomers);

  const handleAdd = () => {
    // TODO: Add new customer functionality
  };

  const handleEdit = () => {
    // TODO: Edit customer functionality
  };

  const handleDelete = () => {
    // TODO: Delete customer functionality
  };

  const handleContact = () => {
    // TODO: Contact customer functionality
  };

  const getSegmentText = (segment: string) => {
    const texts: Record<string, string> = {
      VIP: "VIP",
      Regular: "Thường xuyên",
      New: "Mới",
      "At Risk": "Rủi ro rời bỏ",
    };
    return texts[segment] || segment;
  };

  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSatisfaction = customers.reduce((sum, c) => sum + c.satisfaction, 0) / customers.length;
  const vipCustomers = customers.filter(c => c.segment === "VIP").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Quản lý khách hàng</h2>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Thêm khách hàng
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Nhóm khách hàng đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Giá trị trọn đời của khách hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mức độ hài lòng trung bình</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Điểm hài lòng của khách hàng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng VIP</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">{((vipCustomers/totalCustomers)*100).toFixed(1)}% tổng số</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Phân khúc khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-52">
              <Doughnut data={segmentData} options={{ 
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
            <CardTitle className="text-lg">Khách hàng theo nền tảng</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="h-52">
              <Bar data={platformData} options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } },
                  x: { grid: { display: false } }
                }
              }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle>Cơ sở dữ liệu khách hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => (
              <div key={customer.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg space-y-4 lg:space-y-0">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {customer.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {customer.platform}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          customer.segment === "VIP"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : customer.segment === "Regular"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : customer.segment === "New"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {getSegmentText(customer.segment)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">{customer.satisfaction}/5</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {customer.location}
                    </div>
                    <div>Tổng chi tiêu: ${customer.totalSpent.toLocaleString()}</div>
                    <div>Đơn hàng: {customer.orders}</div>
                    <div>Hoạt động cuối: {new Date(customer.lastActive).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>❤️ {customer.interactions.likes} thích</div>
                    <div>💬 {customer.interactions.comments} bình luận</div>
                    <div>🔄 {customer.interactions.shares} chia sẻ</div>
                    <div>📧 {customer.interactions.messages} tin nhắn</div>
                  </div>
                  
                  {customer.notes && (
                    <p className="text-sm text-muted-foreground italic">{customer.notes}</p>
                  )}
                </div>
                  <div className="flex flex-row lg:flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleContact}
                    title="Gửi Email"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleContact}
                    title="Gọi điện"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleContact}
                    title="Gửi tin nhắn"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleEdit}
                    title="Sửa"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    onClick={handleDelete}
                    title="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
