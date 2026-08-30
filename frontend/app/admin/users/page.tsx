"use client";

import { useEffect, useState } from "react";
import { userService, AdminUser } from "@/lib/services/userService";
import { Role, MembershipTier } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import UserFormModal from "@/components/UserFormModal";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const handleUpdateUser = async (values: { fullName: string; email: string; phone?: string }) => {
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await userService.update(editingUser.id, values);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, "Cập nhật thất bại"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa tài khoản này? Toàn bộ lịch sử đặt phòng liên quan cũng có thể bị ảnh hưởng.")) return;
    setBusyId(id);
    try {
      await userService.remove(id);
      loadUsers();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể xóa tài khoản này"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Quản lý người dùng</h1>

      {loading && <p className="mt-6 text-neutral-500">Đang tải...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Xác thực</th>
              <th className="px-4 py-3">Membership</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Ngày tham gia</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const isSelf = u.email === currentUser?.email;
              return (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-ink">{u.fullName}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        u.emailVerified ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                      }`}
                    >
                      {u.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={u.membershipTier} disabled={busyId===u.id} onChange={async (e)=>{setBusyId(u.id);try{await userService.grantMembership(u.id,e.target.value as MembershipTier);loadUsers()}catch(err){alert(getErrorMessage(err))}finally{setBusyId(null)}}} className="rounded-lg border border-line px-2 py-1 text-sm focus:border-primary focus:outline-none disabled:opacity-50">
                      <option value="NONE">Chưa có</option><option value="BRONZE">Đồng - 5%</option><option value="SILVER">Bạc - 10%</option><option value="GOLD">Vàng - 15%</option><option value="DIAMOND">Kim cương - 20%</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      disabled={isSelf || busyId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded-lg border border-line px-2 py-1 text-sm focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="mr-3 text-neutral-600 transition hover:text-primary"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleToggleEnabled(u.id)}
                      disabled={isSelf || busyId === u.id}
                      className={`mr-3 rounded-full px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                        u.enabled ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {u.enabled ? "Đang hoạt động" : "Đã khóa"}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={isSelf || busyId === u.id}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <UserFormModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSubmit={handleUpdateUser}
          submitting={submitting}
        />
      )}
    </div>
  );
}