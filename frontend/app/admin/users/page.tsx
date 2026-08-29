"use client";

import { useEffect, useState } from "react";
import { userService, AdminUser } from "@/lib/services/userService";
import { Role } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadUsers = () => {
    setLoading(true);
    userService
      .getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleEnabled = async (id: number) => {
    setBusyId(id);
    try {
      await userService.toggleEnabled(id);
      loadUsers();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (id: number, role: Role) => {
    setBusyId(id);
    try {
      await userService.updateRole(id, role);
      loadUsers();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Quản lý người dùng</h1>

      {loading && <p className="mt-6 text-neutral-500">Đang tải...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Ngày tham gia</th>
              <th className="px-4 py-3 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((u) => {
              const isSelf = u.email === currentUser?.email;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={isSelf || busyId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded-lg border border-neutral-300 px-2 py-1 text-sm disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleEnabled(u.id)}
                      disabled={isSelf || busyId === u.id}
                      className={`rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                        u.enabled ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.enabled ? "Đang hoạt động" : "Đã khóa"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}