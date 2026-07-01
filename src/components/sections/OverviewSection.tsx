"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { TrendingUp, Plus, Youtube, Facebook, MessageCircle, Video, MoreHorizontal, X, Bell, Share2, RefreshCw, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { useResponsive } from "@/hooks/useResponsive";
import { useKeyboardShortcuts } from "@/hooks/useAccessibility";
import { apiFetch } from "@/lib/apiClient";

interface EngagementItem {
  id: number;
  type: string;
  user: string;
  platform: string;
  post: string;
  time: string;
}

export function OverviewSection() {
  const { addToast, ToastContainer } = useToast();
  const { isMobile, isTablet } = useResponsive();
  
  // State management for interactive features
  const [activeTab, setActiveTab] = useState<'locations' | 'age'>('locations');  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    followers: 0,
    reach: 0,
    engagement: 0
  });  const [notifications, setNotifications] = useState<{ id: string | number; message: string; type: string; time: string }[]>([]);

  const fetchNotifications = async () => {
    const result = await apiFetch<{ id: string | number; message: string; type: string; time: string }[]>("notifications");
    if (result.success && result.data) {
      setNotifications(result.data);
    } else {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Thiết lập tự động lấy thông báo mới sau mỗi 30 giây
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Online status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: {
      'ctrl+r': () => handleRefresh(),
      'ctrl+shift+a': () => setShowAddAccountModal(true),
      'escape': () => {
        setShowAddAccountModal(false);
        setShowHelpModal(false);
      },
      '1': () => setActiveTab('locations'),
      '2': () => setActiveTab('age'),
      'ctrl+h': () => setShowHelpModal(true)
    }
  });

  // Animation effect for stats
  useEffect(() => {
    const animateNumbers = async () => {
      let targets = { followers: 2, reach: 24, engagement: 50.0 };

      // Fetch dynamic stats from database
      const res = await apiFetch<EngagementItem[]>("engagements");
      if (res.success && res.data) {
        const engagements = res.data;
        
        // Find latest YouTube subscriber milestone
        const youtubeSubsItem = engagements.find(
          (e) => e.platform === "YouTube" && e.type === "Subscribe"
        );
        let followers = 2; // default
        let reach = 6; // default
        if (youtubeSubsItem) {
          const match = youtubeSubsItem.post.match(/Kênh đạt mốc ([\d.,]+) người đăng ký/);
          if (match) {
            followers = parseInt(match[1].replace(/[,.]/g, ""), 10);
          }
          const matchViews = youtubeSubsItem.post.match(/và ([\d.,]+) lượt xem/);
          if (matchViews) {
            reach = parseInt(matchViews[1].replace(/[,.]/g, ""), 10);
          }
        }

        // Count YouTube comments
        const ytComments = engagements.filter(
          (e) => e.platform === "YouTube" && e.type === "Comment"
        );
        const commentsCount = ytComments.length;

        // Calculate engagement rate
        const engagement = reach > 0 ? parseFloat(((commentsCount / reach) * 100).toFixed(1)) : 0;

        targets = {
          followers,
          reach,
          engagement: engagement > 0 ? engagement : 50.0
        };
      }

      const duration = 2000;
      const steps = 60;
      const increment = duration / steps;

      let current = { followers: 0, reach: 0, engagement: 0 };
      
      const timer = setInterval(() => {
        current.followers += targets.followers / steps;
        current.reach += targets.reach / steps;
        current.engagement += targets.engagement / steps;

        if (current.followers >= targets.followers) {
          current = targets;
          clearInterval(timer);
        }

        setAnimatedStats({
          followers: Math.floor(current.followers),
          reach: Math.floor(current.reach),
          engagement: Math.min(current.engagement, targets.engagement)
        });
      }, increment);
    };

    animateNumbers();
  }, [addToast]);
  // Calendar data for Post Activity with more realistic data - memoized for performance
  const calendarData = useMemo(() => [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ], []);

  const getActivityColor = useMemo(() => (level: number) => {
    switch (level) {
      case 0: return "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700";
      case 1: return "bg-purple-200 dark:bg-purple-800 hover:bg-purple-300 dark:hover:bg-purple-700";
      case 2: return "bg-purple-400 dark:bg-purple-600 hover:bg-purple-500 dark:hover:bg-purple-500";
      case 3: return "bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400";
      default: return "bg-gray-100 dark:bg-gray-800";
    }  }, []);
  const locationData = useMemo<{ country: string; count: number; percentage: number }[]>(() => [], []);
  const ageData = useMemo<{ range: string; count: number; percentage: number }[]>(() => [], []);  // Refresh handler - optimized with useCallback
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    addToast({ description: "Đang làm mới dữ liệu...", type: "info" });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRefreshing(false);
    addToast({ description: "Làm mới dữ liệu thành công!", type: "success" });
  }, [addToast]);
  // Dismiss notification handler
  const dismissNotification = (id: number | string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addToast({ description: "Đã ẩn thông báo", type: "info" });
  };

  // Export data functionality
  const exportData = (format: 'csv' | 'json') => {
    const data = {
      followers: animatedStats.followers,
      reach: animatedStats.reach,
      engagement: animatedStats.engagement,
      locations: locationData,
      ageGroups: ageData,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overview-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // CSV format
      const csv = `Chỉ số,Giá trị\nNgười theo dõi,${data.followers}\nLượt tiếp cận,${data.reach}\nTương tác,${data.engagement}%\n\nVị trí hàng đầu:\n${locationData.map(l => `${l.country},${l.count}`).join('\n')}\n\nĐộ tuổi:\n${ageData.map(a => `${a.range},${a.count}`).join('\n')}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `overview-data-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    addToast({ description: `Dữ liệu đã được xuất dưới định dạng ${format.toUpperCase()}`, type: "success" });
  };

  return (
    <div className="min-h-screen bg-overview-gradient p-3 sm:p-4 lg:p-6 smooth-scroll">
      {/* Notifications Bar */}
      <div className="max-w-7xl mx-auto mb-4 animate-fade-in-up">
        <div className="flex flex-wrap gap-2">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div key={notification.id} className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm text-sm border border-white/20 dark:border-gray-700/20 animate-slide-in-right">
                <Bell className="h-4 w-4 text-blue-500 animate-pulse-slow" />
                <span className="text-gray-700 dark:text-gray-300">{notification.message}</span>
                <span className="text-xs text-gray-500">{notification.time}</span>
                <button 
                  onClick={() => dismissNotification(notification.id)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors touch-friendly"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground p-3 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-lg border border-white/10 dark:border-gray-700/10">
              Chưa có thông báo thực tế nào từ các kênh mạng xã hội đã tích hợp.
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {isOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Cập nhật lần cuối: {currentTime.toLocaleTimeString()}
            </div>
          </div>          <div className="flex items-center gap-2">
            <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </div>            <div className="flex gap-1 ml-4">
              <Tooltip content="Xuất dữ liệu định dạng JSON">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => exportData('json')}
                  title="Xuất dưới định dạng JSON"
                >
                  JSON
                </Button>
              </Tooltip>
              <Tooltip content="Xuất dữ liệu định dạng CSV">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => exportData('csv')}
                  title="Xuất dưới định dạng CSV"
                >                  CSV
                </Button>
              </Tooltip>
              <Tooltip content="Trợ giúp & Phím tắt (Ctrl+H)">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowHelpModal(true)}
                  title="Trợ giúp"
                >
                  ?
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto grid gap-4 lg:gap-6 ${
        isMobile 
          ? 'grid-cols-1 gap-3' 
          : isTablet 
            ? 'grid-cols-1 md:grid-cols-2 gap-4' 
            : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
      }`}>
          {/* Left Column */}
        <div className={`space-y-4 lg:space-y-6 ${
          isMobile ? 'order-1' : isTablet ? 'md:col-span-1 order-1' : 'order-1'
        }`}>
          {/* 1. Profile Summary Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 animate-pulse" />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">@MyYouTubeChannel</span>
              </div>
              <div className="flex items-center gap-2">                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => {
                    addToast({
                      type: 'info',
                      description: 'Đã chia sẻ hồ sơ thành công!'
                    });
                  }}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-end gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.followers.toLocaleString()}
                </h2>
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mb-1" />
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Người theo dõi</p>
              <p className="text-xs text-green-600 dark:text-green-400">+2.1% so với tháng trước</p>
            </div>

            <div className="mb-6">
              <div className="flex gap-2 sm:gap-4 mb-4 border-b border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setActiveTab('locations')}
                  className={`text-xs sm:text-sm font-medium pb-2 px-1 border-b-2 transition-colors ${
                    activeTab === 'locations' 
                      ? 'text-gray-900 dark:text-white border-blue-500' 
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Vị trí hàng đầu
                </button>
                <button 
                  onClick={() => setActiveTab('age')}
                  className={`text-xs sm:text-sm font-medium pb-2 px-1 border-b-2 transition-colors ${
                    activeTab === 'age' 
                      ? 'text-gray-900 dark:text-white border-blue-500' 
                      : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Độ tuổi
                </button>
              </div>              <div className="space-y-3">
                {(activeTab === 'locations' ? locationData : ageData).length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">Chưa có dữ liệu</div>
                ) : (
                  (activeTab === 'locations' ? locationData : ageData).map((item, index) => (
                    <div key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {'country' in item ? item.country : item.range}
                        </span>
                        <span className="text-xs sm:text-sm font-medium">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : 'bg-blue-300'} h-2 rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Lượt xem hồ sơ theo giai đoạn</h3>                <Tooltip content="Làm mới dữ liệu (Ctrl+R)" position="left">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </Button>
                </Tooltip>
              </div>
              <div className="relative h-16 sm:h-20 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg p-3 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 5,35 C 25,25 35,15 55,20 C 75,25 85,10 95,15" 
                    stroke="url(#lineGradient)" 
                    strokeWidth="2" 
                    fill="none"
                    className="animate-pulse"
                  />
                  <circle cx="75" cy="12" r="3" fill="#3B82F6" className="animate-ping" />
                </svg>
                <div className="absolute top-1 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {animatedStats.reach.toLocaleString()} lượt xem
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Your Accounts Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Tài khoản của bạn</h3>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs sm:text-sm"
                onClick={() => setShowAddAccountModal(true)}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Thêm tài khoản
              </Button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* YouTube */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-full flex items-center justify-center text-white">
                    <Youtube className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">@MyYouTubeChannel</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{animatedStats.followers.toLocaleString()} người đăng ký • Đã đăng nhập</p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white hover:bg-green-700 text-xs">Chính</Badge>
              </div>

              {/* Zalo */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0068FF] rounded-full flex items-center justify-center text-white">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Zalo Official Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chưa liên kết</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Kết nối</Button>
              </div>

              {/* TikTok */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center text-white dark:bg-white dark:text-black">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">TikTok Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chưa liên kết</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Kết nối</Button>
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1877f2] rounded-full flex items-center justify-center text-white">
                    <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Facebook Page</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Chưa liên kết</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs">Kết nối</Button>
              </div>
            </div>
          </Card>
        </div>        {/* Center Column */}
        <div className={`space-y-4 lg:space-y-6 ${
          isMobile ? 'order-2' : isTablet ? 'md:col-span-1 order-2' : 'order-2'
        }`}>
          {/* 3. Post Activity Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Hoạt động đăng bài</h3>
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm w-full sm:w-auto">
                Thay đổi giai đoạn
              </Button>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Từ 15 tháng 2 - 15 tháng 5, 2024</p>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Tin (Stories)</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bài viết</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">0</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Thước phim (Reels)</p>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarData.flat().map((level, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-6 sm:h-6 rounded cursor-pointer transition-all duration-200 ${getActivityColor(level)}`}
                  title={`${level} bài viết vào ngày ${i + 1}`}                  onClick={() => {
                    addToast({
                      type: 'info',
                      description: `Ngày ${i + 1}: ${level} bài viết. Nhấn để xem chi tiết.`
                    });
                  }}
                />
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
              <span>Ít hoạt động</span>
              <span>Nhiều hoạt động</span>
            </div>
          </Card>

          {/* 4. Anomaly Detection Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Phát hiện bất thường</h3>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
              Chưa phát hiện bất thường nào trên các kênh mạng xã hội của bạn.
            </p>
            
            <div className="relative mb-4 sm:mb-6">
              <div className="flex items-end gap-1 sm:gap-2 h-24 sm:h-32">
                {[0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                  <div key={i} className="flex-1 bg-teal-200 dark:bg-teal-700 rounded-t hover:bg-teal-300 dark:hover:bg-teal-600 transition-colors cursor-pointer" style={{ height: `${height}%` }}>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">0%</p>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Dự đoán</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">0%</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">Phụ</p>
              </div>
            </div>
            
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors" size="sm">
              Xem chi tiết
            </Button>
          </Card>
        </div>        {/* Right Column */}
        <div className={`space-y-4 lg:space-y-6 ${
          isMobile ? 'order-3' : isTablet ? 'md:col-span-2 order-3' : 'order-3'
        }`}>
          {/* 5. Post Schedule Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Lịch đăng bài</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">0 bài viết đã lên lịch</p>
              </div>
              <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 text-xs sm:text-sm w-full sm:w-auto">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Thêm bài viết
              </Button>
            </div>
            
            <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
              <div className="text-center py-12 text-sm text-gray-500">
                Chưa có lịch đăng bài nào
              </div>
            </div>
          </Card>

          {/* 6. Post Insights Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Thông tin chi tiết bài viết</h3>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-xs">📊</span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">Chưa có bài viết nào được chọn</p>
            
            <div className="space-y-4 mb-4 sm:mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Tài khoản tiếp cận</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {animatedStats.reach.toLocaleString()}
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Người theo dõi</p>
                <p className="text-base sm:text-lg font-bold text-blue-600">0</p>
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <div className="flex items-end gap-1 h-12 sm:h-16">
                {[0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-blue-400 dark:bg-blue-600 rounded-t hover:bg-blue-500 dark:hover:bg-blue-500 transition-colors cursor-pointer" 
                    style={{ height: `${height}%` }}
                    title={`Tương tác: ${height}%`}
                  />
                ))}
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Phát hiện độc đáo</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">
                Chưa có phát hiện độc đáo nào.
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-xs sm:text-sm" disabled>
                Đăng ký nhận phân tích khác
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Thêm tài khoản mới</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowAddAccountModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nền tảng
                </label>
                <select className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>YouTube</option>
                  <option>Zalo</option>
                  <option>TikTok</option>
                  <option>Facebook</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên người dùng
                </label>
                <input 
                  type="text" 
                  placeholder="@tennguoidung"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowAddAccountModal(false)}
                >
                  Hủy
                </Button>                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowAddAccountModal(false);
                    addToast({
                      type: 'success',
                      description: 'Kết nối tài khoản thành công!'
                    });
                  }}
                >
                  Kết nối tài khoản
                </Button>
              </div>
            </div>
          </div>        </div>      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trợ giúp & Phím tắt bàn phím</h3>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowHelpModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Phím tắt bàn phím</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Làm mới dữ liệu</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl + R</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Thêm tài khoản</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl + Shift + A</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Hiển thị trợ giúp</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Ctrl + H</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Chuyển sang tab vị trí</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">1</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Chuyển sang tab độ tuổi</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">2</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Đóng hộp thoại</span>
                    <code className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs">Escape</code>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Tính năng</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Cập nhật thời gian thực</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Bảng điều khiển cập nhật mỗi giây với thời gian hiện tại và trạng thái kết nối mạng.</p>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h5 className="font-medium text-green-900 dark:text-green-100 mb-1">Xuất dữ liệu</h5>
                    <p className="text-sm text-green-700 dark:text-green-300">Xuất dữ liệu phân tích của bạn ở định dạng JSON hoặc CSV bằng cách sử dụng các nút trên thanh trạng thái.</p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Biểu đồ tương tác</h5>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Nhấp vào các ngày trên lịch hoặc các thành phần biểu đồ để xem thông tin chi tiết.</p>
                  </div>
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Thiết kế tương thích (Responsive)</h5>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Được tối ưu hóa hoàn hảo cho mọi thiết bị từ điện thoại di động đến màn hình máy tính lớn.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowHelpModal(false)}
              >
                Đã hiểu, cảm ơn!
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
}
