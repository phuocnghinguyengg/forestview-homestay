"use client";

import { useEffect, useMemo, useState } from "react";
import { userService, AdminUser } from "@/lib/services/userService";
import { Role, MembershipTier } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import UserFormModal from "@/components/UserFormModal";
import { CheckCircle2, Crown, Edit3, Lock, Search, Shield, Trash2, Unlock, UserCheck, XCircle } from "lucide-react";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

const TIER_COLORS: Record<MembershipTier, string> = {
  NONE: "bg-neutral-100 text-neutral-600",
  BRONZE: "bg-amber-700/10 text-amber-700 border-amber-700/20",
  SILVER: "bg-slate-200 text-slate-700 border-slate-300",
  GOLD: "bg-amber-400/15 text-amber-700 border-amber-400/30",
  DIAMOND: "bg-sky-500/15 text-sky-700 border-sky-400/30",
};

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

      {/* Responsive User Cards - No horizontal scroll! */}
      <div className="space-y-3">
        {filteredUsers.map((u) => {
          const isSelf = u.email === currentUser?.email;
          const initial = u.fullName ? u.fullName.trim().charAt(0).toUpperCase() : "?";

          return (
            <div
              key={u.id}
              className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                u.enabled
                  ? "border-line bg-surface hover:border-primary/40 hover:shadow-xs"
                  : "border-dashed border-red-200 bg-red-50/40 opacity-75"
              }`}
            >
              {/* User info */}
              <div className="flex flex-1 items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 font-display text-base font-bold text-primary">
                  {initial}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{u.fullName}</h3>
                    {isSelf && (
                      <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                        Bạn
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        u.emailVerified ? "bg-primary/10 text-primary" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {u.emailVerified ? (
                        <>
                          <CheckCircle2 size={11} /> Đã xác thực
                        </>
                      ) : (
                        <>
                          <XCircle size={11} /> Chưa xác thực
                        </>
                      )}
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-xs text-neutral-500">{u.email}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">Tham gia: {formatDate(u.createdAt)}</p>
                </div>
              </div>

              {/* Roles & Membership & Actions in one compact row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                {/* Membership tier selector */}
                <div className="flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-500" />
                  <select
                    value={u.membershipTier}
                    disabled={busyId === u.id}
                    onChange={(e) => handleMembershipChange(u.id, e.target.value as MembershipTier)}
                    className="rounded-xl border border-line bg-base/50 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="NONE">Chưa có hạng</option>
                    <option value="BRONZE">Đồng - 5%</option>
                    <option value="SILVER">Bạc - 10%</option>
                    <option value="GOLD">Vàng - 15%</option>
                    <option value="DIAMOND">Kim cương - 20%</option>
                  </select>
                </div>

                {/* Role selector */}
                <div className="flex items-center gap-1.5">
                  <Shield size={14} className="text-primary" />
                  <select
                    value={u.role}
                    disabled={isSelf || busyId === u.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                    className="rounded-xl border border-line bg-base/50 px-2.5 py-1.5 text-xs font-medium text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                {/* Status Toggle & Edit/Delete */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(u.id)}
                    disabled={isSelf || busyId === u.id}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${
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
            </div>
          );
        })}

        {!loading && filteredUsers.length === 0 && (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-sm text-neutral-500">
            Không tìm thấy người dùng nào phù hợp.
          </div>
        )}
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