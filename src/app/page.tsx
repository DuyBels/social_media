"use client";

// Social Media Management Dashboard Main Page

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggler } from "../components/ThemeToggler";
import { Sidebar } from "../components/Sidebar";
import { DashboardHome } from "../components/DashboardHome";

const sectionTitles: Record<string, string> = {
  dashboard: "Bảng điều khiển",
  overview: "Tổng quan",
  posts: "Bài viết",
  analytics: "Phân tích",
  engagement: "Tương tác",
  campaigns: "Chiến dịch",
  customers: "Khách hàng",
  users: "Người dùng",
  settings: "Cài đặt",
};

export default function Home() {
  const [selectedSection, setSelectedSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors">
      <Sidebar 
        selected={selectedSection} 
        onSelect={setSelectedSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col lg:ml-0 min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold truncate">Bảng điều khiển Mạng xã hội</h1>
              <p className="text-xs text-muted-foreground capitalize">
                {sectionTitles[selectedSection] || selectedSection}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Cập nhật lần cuối: vừa xong</span>
            </div>
            <ThemeToggler />
          </div>
        </header>
        <section className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-muted/30">
          <DashboardHome section={selectedSection} />
        </section>
      </main>
    </div>
  );
}
