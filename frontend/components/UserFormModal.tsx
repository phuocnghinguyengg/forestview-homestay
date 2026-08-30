"use client";

import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { AdminUser, AdminUserUpdatePayload } from "@/lib/services/userService";

export default function UserFormModal({
  user,
  onClose,
  onSubmit,
  submitting,
}: {
  user: AdminUser;
  onClose: () => void;
  onSubmit: (values: AdminUserUpdatePayload) => void;
  submitting: boolean;
}) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState<string | undefined>(user.phone ?? undefined);
  const [error, setError] = useState("");

  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (phone && !isValidPhoneNumber(phone)) {
      setError("Số điện thoại không hợp lệ");
      return;
    }

    onSubmit({ fullName, email, phone });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-6">
        <h2 className="font-display text-xl text-ink">Sửa thông tin người dùng</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-sm text-neutral-600">Họ và tên</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            {emailChanged && (
              <p className="mt-1 text-xs text-accent">
                ⚠ Thay đổi email sẽ khiến tài khoản này chuyển về trạng thái <b>chưa xác thực</b> — người dùng cần xác thực lại để đặt phòng.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-neutral-600">Số điện thoại</label>
            <div className="phone-input-wrapper mt-1">
              <PhoneInput international defaultCountry="VN" value={phone} onChange={setPhone} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}