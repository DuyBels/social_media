"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

type User = {
  id: string;
  name: string;
  role: "admin" | "editor" | "viewer";
  email: string;
  status: "active" | "invited" | "suspended";
};

const demoUsers: User[] = [
  { id: "1", name: "Alice", role: "admin", email: "alice@email.com", status: "active" },
  { id: "2", name: "Bob", role: "editor", email: "bob@email.com", status: "active" },
  { id: "3", name: "Charlie", role: "viewer", email: "charlie@email.com", status: "invited" },
  { id: "4", name: "Dana", role: "editor", email: "dana@email.com", status: "suspended" },
];

export function UsersSection() {
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      const res = await apiFetch<User[]>("users");
      if (res.success && res.data) {
        setUsers(res.data);
      }
      setLoading(false);
    }
    loadUsers();
  }, []);

  // Placeholder CRUD handlers
  const handleAdd = async () => {
    const newUser: Omit<User, "id"> = {
      name: `User ${users.length + 1}`,
      role: "viewer",
      email: `user${users.length + 1}@email.com`,
      status: "invited",
    };

    const res = await apiFetch<User>("users", {
      method: "POST",
      body: JSON.stringify(newUser),
    });

    if (res.success && res.data) {
      setUsers((prev) => [...prev, res.data!]);
    } else {
      // Cơ chế dự phòng ngoại tuyến
      const localNewUser: User = {
        id: String(Date.now()),
        ...newUser,
      };
      setUsers((prev) => [...prev, localNewUser]);
    }
  };

  const handleEdit = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    const updatedUser = {
      ...targetUser,
      name: `${targetUser.name} (Đã sửa)`,
    };

    const res = await apiFetch<User>(`users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatedUser),
    });

    if (res.success && res.data) {
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data! : u)));
    } else {
      // Cơ chế dự phòng ngoại tuyến
      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
    }
  };

  const handleDelete = async (id: string) => {
    const res = await apiFetch<void>(`users/${id}`, {
      method: "DELETE",
    });

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      // Cơ chế dự phòng ngoại tuyến
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const getRoleText = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Quản trị viên",
      editor: "Biên tập viên",
      viewer: "Người xem",
    };
    return roles[role] || role;
  };

  const getStatusText = (status: string) => {
    const statuses: Record<string, string> = {
      active: "Hoạt động",
      invited: "Đã mời",
      suspended: "Tạm ngưng",
    };
    return statuses[status] || status;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Quản lý người dùng</h2>
        <Button onClick={handleAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Mời người dùng
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Đang tải danh sách người dùng...</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{user.name} ({getRoleText(user.role)})</span>
                  <span
                    className={
                      user.status === "active"
                        ? "text-green-600"
                        : user.status === "invited"
                        ? "text-blue-600"
                        : "text-red-600"
                    }
                  >
                    {getStatusText(user.status)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>{user.email}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(user.id)} title="Sửa">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(user.id)} title="Xóa">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
