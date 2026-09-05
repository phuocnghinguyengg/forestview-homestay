"use client";

import { useEffect, useMemo, useState } from "react";
import { userService, AdminUser } from "@/lib/services/userService";
import { Role, MembershipTier } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import UserFormModal from "@/components/UserFormModal";
import { CheckCircle2, Edit3, Lock, Search, Trash2, Unlock, XCircle } from "lucide-react";

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
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");

  const loadUsers = () => {
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

  const handleMembershipChange = async (id: number, tier: MembershipTier) => {
    setBusyId(id);
    try {
      await userService.grantMembership(id, tier);
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

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchSearch =
        search.trim() === "" ||
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [users, roleFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Quản lý khách hàng</h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Tổng {users.length} tài khoản ({users.filter((u) => u.emailVerified).length} đã xác thực)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm theo tên khách hàng, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-line bg-base/50 py-2 pr-3 pl-9 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRoleFilter("ALL")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              roleFilter === "ALL" ? "bg-primary text-white shadow-xs" : "bg-base text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("USER")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              roleFilter === "USER" ? "bg-primary text-white shadow-xs" : "bg-base text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Khách (USER)
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter("ADMIN")}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
              roleFilter === "ADMIN" ? "bg-primary text-white shadow-xs" : "bg-base text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            Quản trị (ADMIN)
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-neutral-500">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-line border-t-primary" />
          Đang tải danh sách người dùng...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Danh sách khách hàng - bảng cột cố định, không co giãn theo nội dung */}
      <div className="overflow-x-auto rounded-2xl border border-line">
        <div className="min-w-[880px]">
          {/* Header */}
          <div className="grid grid-cols-[minmax(0,1fr)_170px_120px_130px_190px] gap-3 border-b border-line bg-base/60 px-4 py-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            <div>Khách hàng</div>
            <div>Hạng thành viên</div>
            <div>Vai trò</div>
            <div>Trạng thái</div>
            <div className="text-right">Hành động</div>
          </div>

          {filteredUsers.map((u) => {
            const isSelf = u.email === currentUser?.email;
            const initial = u.fullName ? u.fullName.trim().charAt(0).toUpperCase() : "?";

            return (
              <div
                key={u.id}
                className={`grid grid-cols-[minmax(0,1fr)_170px_120px_130px_190px] items-center gap-3 border-b border-line/60 px-4 py-3.5 transition last:border-b-0 ${
                  u.enabled ? "hover:bg-base/30" : "bg-red-50/40 opacity-75"
                }`}
              >
                {/* Khách hàng */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-sm font-bold text-primary">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="truncate font-semibold text-ink">{u.fullName}</h3>
                      {isSelf && (
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">Bạn</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-neutral-500">{u.email}</p>
                    <p className="text-[10px] text-neutral-400">Tham gia: {formatDate(u.createdAt)}</p>
                    <span
                      className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        u.emailVerified ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {u.emailVerified ? (
                        <>
                          <CheckCircle2 size={10} /> Đã xác thực
                        </>
                      ) : (
                        <>
                          <XCircle size={10} /> Chưa xác thực
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Hạng thành viên */}
                <div>
                  <select
                    value={u.membershipTier}
                    disabled={busyId === u.id}
                    onChange={(e) => handleMembershipChange(u.id, e.target.value as MembershipTier)}
                    className="w-full rounded-xl border border-line bg-base/50 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="NONE">Chưa có hạng</option>
                    <option value="BRONZE">Đồng - 5%</option>
                    <option value="SILVER">Bạc - 10%</option>
                    <option value="GOLD">Vàng - 15%</option>
                    <option value="DIAMOND">Kim cương - 20%</option>
                  </select>
                </div>

                {/* Vai trò */}
                <div>
                  <select
                    value={u.role}
                    disabled={isSelf || busyId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="w-full rounded-xl border border-line bg-base/50 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {/* Trạng thái */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(u.id)}
                    disabled={isSelf || busyId === u.id}
                    className={`inline-flex w-full items-center justify-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
                      u.enabled
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    {u.enabled ? (
                      <>
                        <Unlock size={12} /> Hoạt động
                      </>
                    ) : (
                      <>
                        <Lock size={12} /> Đã khóa
                      </>
                    )}
                  </button>
                </div>

                {/* Hành động */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(u)}
                    className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink shadow-2xs hover:border-primary hover:text-primary"
                  >
                    <Edit3 size={13} /> Sửa
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(u.id)}
                    disabled={isSelf || busyId === u.id}
                    className="rounded-xl p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && filteredUsers.length === 0 && (
            <div className="p-8 text-center text-sm text-neutral-500">Không tìm thấy người dùng nào phù hợp.</div>
          )}
        </div>
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