"use client";

import { Home, Calendar, BarChart2, Users, MessageCircle, Settings, UserCheck, Target, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { key: "dashboard", label: "Bảng điều khiển", icon: Home },
  { key: "overview", label: "Tổng quan", icon: Eye },
  { key: "posts", label: "Bài viết", icon: Calendar },
  { key: "analytics", label: "Phân tích", icon: BarChart2 },
  { key: "engagement", label: "Tương tác", icon: MessageCircle },
  { key: "campaigns", label: "Chiến dịch", icon: Target },
  { key: "customers", label: "Khách hàng", icon: UserCheck },
  { key: "users", label: "Người dùng", icon: Users },
  { key: "settings", label: "Cài đặt", icon: Settings },
];

export function Sidebar({
  selected,
  onSelect,
  isOpen,
  onClose,
}: {
  selected: string;
  onSelect: (key: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const handleItemClick = (key: string) => {
    onSelect(key);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative lg:translate-x-0 w-64 min-h-screen bg-card border-r flex flex-col z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="flex-1 py-4 lg:py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={cn(
                "flex items-center w-full px-4 py-3 rounded-lg text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                selected === item.key && "bg-accent text-accent-foreground font-semibold"
              )}
              onClick={() => handleItemClick(item.key)}
              aria-current={selected === item.key ? "page" : undefined}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-4 text-xs text-muted-foreground text-center border-t">
          &copy; {new Date().getFullYear()} Bảng điều khiển Mạng xã hội
        </div>
      </aside>
    </>
  );
}
