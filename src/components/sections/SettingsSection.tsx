"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggler } from "../ThemeToggler";

export function SettingsSection() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Cài đặt</h2>
      <Card>
        <CardHeader>
          <CardTitle>Giao diện</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span>Chủ đề</span>
            <ThemeToggler />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tài khoản</CardTitle>
        </CardHeader>
        <CardContent>
          <span className="text-muted-foreground">Cài đặt tài khoản và tích hợp sẽ sớm ra mắt.</span>
        </CardContent>
      </Card>
    </div>
  );
}
