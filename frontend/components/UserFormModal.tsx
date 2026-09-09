"use client";

import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { UserCog, X } from "lucide-react";
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
    <div className="modal-overlay">
      <div role="dialog" aria-modal="true" aria-label="Sửa thông tin người dùng" className="modal-panel max-w-md">
        <div className="modal-head flex items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><UserCog size={17} /></span>
            <h2 className="font-display text-lg">Sửa thông tin người dùng</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={17} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <label className="field-label">Họ và tên
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="field-input mt-1"
            />
          </label>

          <label className="field-label">Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input mt-1"
            />
            {emailChanged && (
              <p className="mt-1.5 text-xs font-normal text-accent-dark">
                ⚠ Thay đổi email sẽ khiến tài khoản này chuyển về trạng thái <b>chưa xác thực</b> — người dùng cần xác thực lại để đặt phòng.
              </p>
            )}
          </label>

          <label className="field-label">Số điện thoại
            <div className="phone-input-wrapper mt-1">
              <PhoneInput international defaultCountry="VN" value={phone} onChange={setPhone} />
            </div>
          </label>

          {error && <p className="text-sm text-rose">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
